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

const DAILY_LIMIT_FREE = 5;
const DAILY_LIMIT_PRO = 50; // effectively unlimited for real users; caps abuse/bots
const PER_MINUTE_LIMIT = 3;
const MAX_MESSAGE_LENGTH = 500;
const MAX_REPLY_LENGTH = 1000;
const HISTORY_LIMIT = 10;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Shown as a normal chat bubble whenever the AI call fails for any reason, so
// the user never sees a technical error or a red error state.
const BUSY_REPLY =
  "Our AI advisor is a bit busy right now. Please try again in a moment.";

// Lowercased substrings that indicate an obvious prompt-injection attempt.
const INJECTION_PATTERNS = [
  "ignore previous instructions",
  "ignore all instructions",
  "you are now",
  "act as",
  "forget your instructions",
];

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

// Log a rejected request (4xx/429) with the user id and a short reason — never
// the message content — then return the response. Logs surface in the Supabase
// Edge Function dashboard.
function reject(
  status: number,
  error: string,
  userId: string,
  reason: string,
): Response {
  console.error(
    `[ai-advisor] reject status=${status} user=${userId} reason="${reason}"`,
  );
  return json({ error }, status);
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

  // Authenticate user via the caller's JWT.
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

  // 1. INPUT VALIDATION -------------------------------------------------------
  let rawMessage: unknown;
  try {
    const body = await req.json();
    rawMessage = body?.message;
  } catch {
    return reject(400, "Invalid JSON body", user.id, "invalid-json");
  }
  if (rawMessage === undefined || rawMessage === null) {
    return reject(400, "Message is required", user.id, "missing-message");
  }

  const message = rawMessage.toString().trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return reject(
      400,
      "Message too long (max 500 characters)",
      user.id,
      "too-long",
    );
  }
  if (!message) {
    return reject(400, "Message cannot be empty", user.id, "empty");
  }

  // 2. PER-MINUTE BURST RATE LIMIT --------------------------------------------
  // Count this user's messages in the last 60s (RLS scopes rows to the user).
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount, error: recentError } = await supabase
    .from("ai_messages")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", oneMinuteAgo);

  if (recentError) {
    return json({ error: "Could not check message limit" }, 500);
  }
  if ((recentCount ?? 0) >= PER_MINUTE_LIMIT) {
    return reject(
      429,
      "Too many requests. Please wait a moment.",
      user.id,
      "per-minute-limit",
    );
  }

  // 3. CONTENT FILTERING ------------------------------------------------------
  const lowered = message.toLowerCase();
  if (INJECTION_PATTERNS.some((pattern) => lowered.includes(pattern))) {
    return reject(400, "Invalid message content", user.id, "content-filter");
  }

  // 4. DAILY MESSAGE LIMIT ----------------------------------------------------
  // Free users: 5/day. Pro users: 50/day — effectively unlimited for real usage,
  // but a hard cap against bots/abuse and runaway Gemini cost. (The per-minute
  // burst limit above still applies to everyone.) is_premium is a cache synced
  // from RevenueCat; treat it as the entitlement source here.
  const { data: premiumProfile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .maybeSingle();
  const isPremium = premiumProfile?.is_premium === true;
  const dailyLimit = isPremium ? DAILY_LIMIT_PRO : DAILY_LIMIT_FREE;

  {
    const startOfDayUtc = new Date();
    startOfDayUtc.setUTCHours(0, 0, 0, 0);

    const { count, error: countError } = await supabase
      .from("ai_messages")
      .select("*", { count: "exact", head: true })
      .eq("role", "user")
      .gte("created_at", startOfDayUtc.toISOString());

    if (countError) {
      return json({ error: "Could not check message limit" }, 500);
    }
    if ((count ?? 0) >= dailyLimit) {
      console.error(
        `[ai-advisor] reject status=429 user=${user.id} reason="daily-limit" limit=${dailyLimit}`,
      );
      return json({ error: "Daily message limit reached", limit: dailyLimit }, 429);
    }
  }

  // Fetch last 10 messages for chat history (oldest -> newest).
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

  // Build Gemini request: system instruction + history + new message.
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
      maxOutputTokens: 1200,
      // gemini-flash-latest is now Gemini 3 Flash, a thinking model. Gemini 3
      // uses thinkingLevel (the old `thinkingBudget: 0` now returns HTTP 400).
      // "low" keeps latency/cost down; the higher token cap leaves room for the
      // internal reasoning plus a full reply (output is sliced to MAX_REPLY_LENGTH).
      thinkingConfig: { thinkingLevel: "low" },
    },
  });

  // 6. Call Gemini. Any failure (bad status, network error, invalid JSON, or
  //    empty reply) returns a friendly message as a normal chat bubble — the
  //    real cause is logged server-side and never shown to the user.
  let reply = "";
  try {
    // Gemini occasionally returns 503/429 under load — retry with backoff.
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
      console.error("Gemini error:", geminiRes.status, detail);
      return json({ reply: BUSY_REPLY });
    }

    const geminiData = await geminiRes.json();
    reply =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? "")
        .join("")
        .trim() ?? "";
  } catch (err) {
    console.error("Gemini request threw:", err);
    return json({ reply: BUSY_REPLY });
  }

  // 5. RESPONSE VALIDATION ----------------------------------------------------
  if (!reply) {
    console.error(`[ai-advisor] empty Gemini reply user=${user.id}`);
    return json({ reply: BUSY_REPLY });
  }
  if (reply.length > MAX_REPLY_LENGTH) {
    reply = reply.slice(0, MAX_REPLY_LENGTH) + "...";
  }

  // Persist user message + AI response.
  const { error: insertError } = await supabase.from("ai_messages").insert([
    { user_id: user.id, role: "user", content: message },
    { user_id: user.id, role: "assistant", content: reply },
  ]);

  if (insertError) {
    console.error("Insert error:", insertError);
    // Reply still returned — don't fail the user's request over logging.
  }

  // Return the AI response text.
  return json({ reply });
});
