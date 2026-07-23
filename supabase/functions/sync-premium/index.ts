// supabase/functions/sync-premium/index.ts
//
// Client-triggered counterpart to the RevenueCat webhook. The signed-in app
// calls this whenever its entitlements change (purchase/restore/app-start) so
// profiles.is_premium can't stay stale when a webhook is missed or delayed
// (e.g. sandbox "already own" / transfer cases). Security is unchanged: we
// identify the user from their JWT, then RE-VERIFY the entitlement server-side
// against the RevenueCat API — the client can't spoof premium, only trigger a
// re-check of its own real entitlement.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RC_SECRET_KEY = Deno.env.get("REVENUECAT_SECRET_API_KEY")!;

const ENTITLEMENT = "MySubList Pro";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // 1. Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization header" }, 401);

  const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await authed.auth.getUser();
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  // 2. Re-verify the current entitlement from RevenueCat (appUserID = user.id).
  const rcRes = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
    { headers: { Authorization: `Bearer ${RC_SECRET_KEY}` } },
  );
  if (!rcRes.ok) {
    console.error("[sync-premium] RC lookup failed", rcRes.status);
    return json({ error: "Entitlement check failed" }, 502);
  }
  const rcData = await rcRes.json();
  const ent = rcData?.subscriber?.entitlements?.[ENTITLEMENT];
  const expiresMs = ent?.expires_date ? Date.parse(ent.expires_date) : null;
  const isPremium = !!ent && (expiresMs === null || expiresMs > Date.now());

  // 3. Write the truth via the service role (bypasses RLS + protect trigger).
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await admin
    .from("profiles")
    .update({ is_premium: isPremium })
    .eq("id", user.id);
  if (error) {
    console.error("[sync-premium] update failed", error.message);
    return json({ error: "DB update failed" }, 500);
  }

  console.log(`[sync-premium] user=${user.id} is_premium=${isPremium}`);
  return json({ is_premium: isPremium });
});
