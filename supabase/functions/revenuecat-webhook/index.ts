// supabase/functions/revenuecat-webhook/index.ts
//
// Receives RevenueCat webhook events and syncs profiles.is_premium from the
// REAL entitlement state (source of truth). On every event we re-query the
// RevenueCat REST API for the subscriber and set is_premium accordingly, so the
// DB cache can never drift or be spoofed by the client. Deployed with
// --no-verify-jwt; authenticated instead by a shared Authorization secret.
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET")!;
const RC_SECRET_KEY = Deno.env.get("REVENUECAT_SECRET_API_KEY")!;

const ENTITLEMENT = "MySubList Pro";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Constant-time string comparison so the shared-secret check doesn't leak the
// secret via response timing. (Length is compared first, which is acceptable.)
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

Deno.serve(async (req) => {
  // 1. Authenticate the webhook via the shared secret (set in RC dashboard).
  if (!safeEqual(req.headers.get("Authorization") ?? "", WEBHOOK_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse the event and pull the app_user_id (= our Supabase user id).
  let body: { event?: { app_user_id?: string } };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  const appUserId = body?.event?.app_user_id;
  // Ack anything without a valid UUID (e.g. anonymous ids) so RC won't retry.
  if (!appUserId || !UUID_RE.test(appUserId)) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. REST-verify the CURRENT entitlement state from RevenueCat.
  const rcRes = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    { headers: { Authorization: `Bearer ${RC_SECRET_KEY}` } },
  );
  if (!rcRes.ok) {
    console.error("[rc-webhook] RC lookup failed", rcRes.status);
    return new Response("RC lookup failed", { status: 500 }); // RC retries
  }
  const rcData = await rcRes.json();
  const ent = rcData?.subscriber?.entitlements?.[ENTITLEMENT];
  const expiresMs = ent?.expires_date ? Date.parse(ent.expires_date) : null;
  // Active when the entitlement exists and is either lifetime (no expiry) or
  // not yet expired.
  const isPremium = !!ent && (expiresMs === null || expiresMs > Date.now());

  // 4. Write the truth via the service role (bypasses RLS + protect trigger).
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: isPremium })
    .eq("id", appUserId);
  if (error) {
    console.error("[rc-webhook] profile update failed", error.message);
    return new Response("DB update failed", { status: 500 });
  }

  console.log(`[rc-webhook] user=${appUserId} is_premium=${isPremium}`);
  return new Response(JSON.stringify({ ok: true, is_premium: isPremium }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
