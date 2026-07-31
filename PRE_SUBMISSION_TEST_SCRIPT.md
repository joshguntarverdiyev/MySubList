# MySubList — Pre-Submission Test Script

Run this on a **real TestFlight/dev build on a physical iPhone** (not Expo Go — the paywall, RevenueCat, and notifications need native modules). Check each box; if anything fails, note it at the bottom and stop before submitting.

**You will need:**
- [ ] A physical iPhone with the latest build installed
- [ ] Account **A** — has 2+ subscriptions and is **Premium** (sandbox purchase is fine)
- [ ] Account **B** — a **different, free** account with its own subscriptions
- [ ] A StoreKit **sandbox** Apple ID signed in (Settings → App Store → Sandbox Account)

---

## 1. Cross-account data leak  ⭐ most important

- [ ] 1.1 Sign in as **A**. Open Home, Profile, Advisor — confirm you see A's subs, name, avatar, and Premium status.
- [ ] 1.2 Profile → **Sign Out**.
- [ ] 1.3 Sign in as **B** immediately.
- [ ] 1.4 **PASS =** at no point (not even a flash) do you see A's name, avatar, subscriptions, spend totals, or Premium UI. B shows only B's data.
- [ ] 1.5 Repeat but instead of Sign Out, force a session end: delete/deactivate A's session from another device (or wait for token expiry), return to the app.
- [ ] 1.6 **PASS =** app returns to the sign-in screen with **no** stale data visible.

> ❌ If B ever sees A's data → **do not submit**, tell me.

---

## 2. "50 AI messages/day" copy (no "unlimited AI" anywhere)

- [ ] 2.1 Open the **Paywall** (Profile → Upgrade). Feature list says **"50 AI Advisor Messages / Day"**.
- [ ] 2.2 Profile screen upgrade banner says **"…and 50 AI messages per day"**.
- [ ] 2.3 Advisor: as a **free** user send 5 messages; the limit message says **"…Upgrade to Premium for 50 AI messages per day."**
- [ ] 2.4 Profile → Help Center → the AI/premium FAQ answers say **"50 messages per day"**.
- [ ] 2.5 **PASS =** the word "unlimited" never appears next to AI/messages (only "unlimited **subscriptions**" is allowed).

---

## 3. Month-end renewal date (app + AI agree)

- [ ] 3.1 Add a **Monthly** subscription with **start date = January 31** (any recent year).
- [ ] 3.2 Open the **Calendar** and step through months. Renewal lands on **Feb 28 → Mar 31 → Apr 30 → May 31** (NOT stuck on the 28th).
- [ ] 3.3 On the subscription's detail screen, "Next payment" shows the correct upcoming last-valid day.
- [ ] 3.4 In **Advisor**, ask "What's my monthly spend?" — the number matches Home's "Spent This Month".
- [ ] 3.5 **PASS =** dates follow end-of-month correctly and Home ≈ Advisor totals.

---

## 4. Delete Account

- [ ] 4.1 Profile screen: **Delete Account** appears directly **below Sign Out** (red, in the ACCOUNT card).
- [ ] 4.2 It is **NOT** also under Account → Privacy & Security anymore (only one entry point).
- [ ] 4.3 Tap it → confirmation alert → **Delete**.
- [ ] 4.4 **PASS =** app lands on the **sign-in** screen; trying to sign in again with that account **fails** (account truly gone).

---

## 5. Light mode (forced)

- [ ] 5.1 iPhone Settings → Display → **Dark** mode ON.
- [ ] 5.2 Open the app and visit every tab + Add Subscription.
- [ ] 5.3 **PASS =** UI stays **light** everywhere; the **date picker** (Add Subscription) is fully readable; the keyboard/alerts don't clash.

---

## 6. Currency & offline totals

- [ ] 6.1 Profile → Currency → set to **JPY** (Premium needed to pick non-EUR/USD).
- [ ] 6.2 **PASS =** amounts show **"¥1200"** style — **no** ".00" decimals.
- [ ] 6.3 Add/keep a subscription in a **different** currency than your profile currency.
- [ ] 6.4 Turn on **Airplane Mode**, force-close and reopen the app, open Home and Analytics.
- [ ] 6.5 **PASS =** where a total can't be converted it shows **"Totals unavailable — exchange rates offline"** — never a wrong 1:1 number.
- [ ] 6.6 Turn Airplane Mode off → totals return to normal.

---

## 7. Paywall / premium plumbing

- [ ] 7.1 As a **Premium** user, Account screen shows a **"Manage Subscription"** row → opens the App Store subscriptions page.
- [ ] 7.2 On the Paywall with a **normal** connection, both prices load (monthly + yearly) and **Terms of Use · Privacy Policy** links work.
- [ ] 7.3 Turn on **Airplane Mode**, open the Paywall → the "couldn't load plans" state shows **Retry**, **Restore Purchases**, AND **Terms/Privacy** links.
- [ ] 7.4 Back online: do a **sandbox purchase** → Premium unlocks; **Restore Purchases** on the paywall re-grants it.
- [ ] 7.5 **PASS =** purchase, restore, and manage all work; no euro price shown on a non-EUR sandbox storefront.

---

## Smoke pass (quick, catch regressions)

- [ ] Sign up a brand-new account → onboarding → add a sub → it appears on Home & Calendar.
- [ ] Renewal notification permission prompt appears on first add; a reminder schedules.
- [ ] Advisor returns a reply to a normal question.
- [ ] No crash on: backgrounding mid-AI-request, backgrounding mid-purchase, rotating the phone (should stay portrait).

---

## Result

- [ ] **All boxes checked → Section A complete.** Proceed to the ASC items (IAP attached, review notes + demo account, screenshots, privacy labels, age rating).

**Failures found (note here before submitting):**
1.
2.
3.
