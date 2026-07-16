// supabase/functions/ai-advisor/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "npm:date-fns@4";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const DAILY_LIMIT = 5;
const HISTORY_LIMIT = 10;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---- Subscription formatting -------------------------------------------------

type Sub = {
  name: string;
  plan_name: string | null;
  price: number;
  currency: string;
  billing_period: "weekly" | "monthly" | "yearly" | "once";
  is_free_trial: boolean;
  is_active: boolean;
  start_date: string;
  trial_end_date: string | null;
};

// Normalize any billing period to a monthly figure for the total.
function toMonthly(price: number, period: Sub["billing_period"]): number {
  switch (period) {
    case "weekly":
      return price * 52 / 12;
    case "yearly":
      return price / 12;
    case "monthly":
      return price;
    case "once":
      return 0; // one-time payments don't recur
  }
}

// Loop guard for weekly subs with very old start dates (mirrors the app).
const MAX_STEPS = 400;

/**
 * All renewal (charge) dates for one subscription within the target month —
 * ported verbatim from src/utils/renewalDates.ts so the advisor's "spent so
 * far this month" total matches the Home dashboard exactly. `month` is
 * 0-indexed (0 = January).
 */
function getRenewalDatesForMonth(sub: Sub, year: number, month: number): Date[] {
  if (!sub.is_active) return [];

  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const scheduleStart =
    sub.is_free_trial && sub.trial_end_date
      ? parseISO(sub.trial_end_date)
      : parseISO(sub.start_date);
  const dates: Date[] = [];

  const within = (d: Date) => !isBefore(d, monthStart) && !isAfter(d, monthEnd);

  if (sub.billing_period === "once") {
    if (within(scheduleStart)) dates.push(scheduleStart);
  } else {
    const step =
      sub.billing_period === "weekly"
        ? addWeeks
        : sub.billing_period === "yearly"
        ? addYears
        : addMonths;
    let d = scheduleStart;
    let steps = 0;
    while (!isAfter(d, monthEnd) && steps < MAX_STEPS) {
      if (within(d)) dates.push(d);
      d = step(d, 1);
      steps += 1;
    }
  }

  return dates;
}

/**
 * Money actually charged so far this month, converted to `targetCurrency` —
 * mirrors calculateMonthToDateSpend in src/services/subscriptions.ts (the
 * figure shown on the Home dashboard).
 */
function monthToDateSpend(
  subs: Sub[],
  targetCurrency: string,
  rates: Record<string, number>,
  today: Date = new Date(),
): number {
  const year = today.getFullYear();
  const month = today.getMonth();
  const floor = startOfDay(today);
  return subs.reduce((sum, sub) => {
    const charges = getRenewalDatesForMonth(sub, year, month).filter(
      (d) => !isAfter(d, floor),
    );
    return sum + charges.length * convert(sub.price, sub.currency, targetCurrency, rates);
  }, 0);
}

// Convert an amount between currencies using EUR-based Frankfurter rates
// (rate[X] = units of X per 1 EUR). 1:1 fallback if a rate is missing.
function convert(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

function buildSystemPrompt(
  subs: Sub[],
  targetCurrency: string,
  rates: Record<string, number>,
): string {
  const list = subs.length
    ? subs
        .map((s) => {
          const plan = s.plan_name ? ` (${s.plan_name})` : "";
          const trial = s.is_free_trial ? " [free trial]" : "";
          const monthlyInTarget = convert(
            toMonthly(s.price, s.billing_period),
            s.currency,
            targetCurrency,
            rates,
          ).toFixed(2);
          const native = `${s.price} ${s.currency}/${s.billing_period}`;
          return `- ${s.name}${plan}: ${native}${trial} (≈ ${monthlyInTarget} ${targetCurrency}/month recurring)`;
        })
        .join("\n")
    : "- (no active subscriptions)";

  // Headline figure the user sees on the Home dashboard.
  const monthToDate = monthToDateSpend(subs, targetCurrency, rates).toFixed(2);
  // Full recurring monthly cost, useful for savings comparisons.
  const recurringMonthly = subs
    .reduce(
      (sum, s) =>
        sum +
        convert(toMonthly(s.price, s.billing_period), s.currency, targetCurrency, rates),
      0,
    )
    .toFixed(2);

  return `You are a smart, friendly subscription management advisor inside the MySubList app. Your job is to help users understand their subscriptions and save money.

The user has these active subscriptions (each line shows the native price and the pre-computed equivalent monthly cost in ${targetCurrency}):
${list}

Spending figures (already converted to ${targetCurrency}):
- Monthly spend so far this month (1st to today): ${monthToDate} ${targetCurrency}. This is the exact "Monthly spend" number shown on the app's Home dashboard — use THIS when the user asks about their monthly spend.
- Full recurring monthly cost if every subscription is billed once per month: ${recurringMonthly} ${targetCurrency}. Use this for savings comparisons and projections, not as their "monthly spend".

Rules for your responses:
- Be concise — max 3-4 sentences per response.
- Be specific — reference their actual subscriptions.
- Be actionable — give clear next steps.
- Be friendly — casual but professional tone.
- Never make up subscription data.
- All amounts are already converted to ${targetCurrency}. Do NOT perform your own currency conversion or invent exchange rates — trust the pre-computed figures above.
- If asked something unrelated to subscriptions or finance, politely redirect back to subscription advice.`;
}

// Fetch live EUR-based rates from Frankfurter (same source as the app).
async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR");
    if (!res.ok) return { EUR: 1 };
    const json = (await res.json()) as { rates: Record<string, number> };
    return { EUR: 1, ...json.rates };
  } catch {
    return { EUR: 1 }; // 1:1 fallback keeps totals sane if rates are down
  }
}

// ---- Handler -----------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // 1. Authenticate user via the caller's JWT.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization header" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  // Parse body.
  let message: string;
  try {
    const body = await req.json();
    message = (body?.message ?? "").toString().trim();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!message) {
    return json({ error: "Message is required" }, 400);
  }

  // 2. Rate limit — count today's user messages (RLS scopes to this user).
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("ai_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", startOfDay.toISOString());

  if (countError) {
    return json({ error: "Could not check message limit" }, 500);
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return json(
      {
        error: "Daily message limit reached",
        limit: DAILY_LIMIT,
      },
      429,
    );
  }

  // 3. Fetch last 10 messages for chat history (oldest -> newest).
  const { data: historyRows, error: historyError } = await supabase
    .from("ai_messages")
    .select("role, content")
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);

  if (historyError) {
    return json({ error: "Could not load chat history" }, 500);
  }
  const history = (historyRows ?? []).reverse();

  // Fetch active subscriptions for the system prompt.
  const { data: subs, error: subsError } = await supabase
    .from("subscriptions")
    .select(
      "name, plan_name, price, currency, billing_period, is_free_trial, is_active, start_date, trial_end_date",
    )
    .eq("is_active", true);

  if (subsError) {
    return json({ error: "Could not load subscriptions" }, 500);
  }

  // Resolve the user's display currency (falls back to EUR) and live rates so
  // mixed-currency subscriptions are converted before the total is computed.
  const { data: profile } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .maybeSingle();
  const targetCurrency = profile?.currency ?? "EUR";
  const rates = await fetchRates();

  const systemPrompt = buildSystemPrompt(
    (subs ?? []) as Sub[],
    targetCurrency,
    rates,
  );

  // 4. Build Gemini request: system instruction + history + new message.
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 400,
      // Gemini 2.5 Flash is a thinking model; without this it burns the
      // token budget on internal reasoning and returns truncated replies.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  // Gemini occasionally returns 503 (UNAVAILABLE) under load — retry a few
  // times with backoff before surfacing the error to the user.
  let geminiRes!: Response;
  for (let attempt = 0; attempt < 3; attempt++) {
    geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
    if (geminiRes.status !== 503 && geminiRes.status !== 429) break;
    if (attempt < 2) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }

  if (!geminiRes.ok) {
    const detail = await geminiRes.text();
    // Full detail stays in the server logs; the client gets a generic message.
    console.error("Gemini error:", geminiRes.status, detail);
    return json({ error: "AI request failed" }, 502);
  }

  const geminiData = await geminiRes.json();
  const reply: string =
    geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim() ?? "";

  if (!reply) {
    return json({ error: "AI returned an empty response" }, 502);
  }

  // 5. Persist user message + AI response.
  const { error: insertError } = await supabase.from("ai_messages").insert([
    { user_id: user.id, role: "user", content: message },
    { user_id: user.id, role: "assistant", content: reply },
  ]);

  if (insertError) {
    console.error("Insert error:", insertError);
    // Reply still returned — don't fail the user's request over logging.
  }

  // 6. Return the AI response text.
  return json({ reply });
});
