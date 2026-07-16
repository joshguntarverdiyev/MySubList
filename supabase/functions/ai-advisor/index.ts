// supabase/functions/ai-advisor/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const DAILY_LIMIT = 5;
const HISTORY_LIMIT = 10;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

function buildSystemPrompt(subs: Sub[]): string {
  const currency = subs[0]?.currency ?? "EUR";
  const list = subs.length
    ? subs
        .map((s) => {
          const plan = s.plan_name ? ` (${s.plan_name})` : "";
          const trial = s.is_free_trial ? " [free trial]" : "";
          return `- ${s.name}${plan}: ${s.price} ${s.currency}/${s.billing_period}${trial}`;
        })
        .join("\n")
    : "- (no active subscriptions)";

  const monthlyTotal = subs
    .reduce((sum, s) => sum + toMonthly(s.price, s.billing_period), 0)
    .toFixed(2);

  return `You are a smart, friendly subscription management advisor inside the MySubList app. Your job is to help users understand their subscriptions and save money.

The user has these active subscriptions:
${list}

Their total monthly spend is ${monthlyTotal} ${currency}.

Rules for your responses:
- Be concise — max 3-4 sentences per response.
- Be specific — reference their actual subscriptions.
- Be actionable — give clear next steps.
- Be friendly — casual but professional tone.
- Never make up subscription data.
- If asked something unrelated to subscriptions or finance, politely redirect back to subscription advice.`;
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
    .select("name, plan_name, price, currency, billing_period, is_free_trial")
    .eq("is_active", true);

  if (subsError) {
    return json({ error: "Could not load subscriptions" }, 500);
  }

  const systemPrompt = buildSystemPrompt((subs ?? []) as Sub[]);

  // 4. Build Gemini request: system instruction + history + new message.
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!geminiRes.ok) {
    const detail = await geminiRes.text();
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
