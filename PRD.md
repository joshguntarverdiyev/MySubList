# MySubList — Product Requirements (PRD)

_Living document. Source of truth for scope. See CLAUDE.md for tech rules, SKILL_UI_UX.md and SKILL_REACT_NATIVE.md for build patterns._

## 1. Overview

MySubList helps people track all their digital subscriptions in one place, see upcoming renewals on a calendar, and get AI-powered advice to save money.

- **Target user:** budget-conscious, smartphone-native people aged 22–45 who pay for multiple digital subscriptions (Netflix, Spotify, Adobe, Amazon Prime…) and want control over spending.
- **Monetization:** Freemium via **RevenueCat**.
  - **Free:** up to **5 subscriptions**, **5 AI messages/day**.
  - **Premium (€3.99/mo or €29.99/yr):** unlimited subscriptions + unlimited AI messages.
  - `profiles.is_premium` is a cache; **RevenueCat is the source of truth**. All limits enforced **server-side**.

## 2. Screens (14)

| # | Screen | Path | Purpose | Reads / Writes |
|---|---|---|---|---|
| 1 | Splash | native + `index.tsx` | Branded load; route to onboarding or tabs | session |
| 2 | Welcome | `(onboarding)/welcome.tsx` | Orbit icons, tagline, Get Started, "I have an account" | — |
| 3 | Onboarding 1 | `(onboarding)/step-1.tsx` | "Find the ghost costs" — dashboard preview | — |
| 4 | Onboarding 2 | `(onboarding)/step-2.tsx` | "Track renewals" — calendar preview | — |
| 5 | Onboarding 3 | `(onboarding)/step-3.tsx` | "Your AI assistant" — chat preview | — |
| 6 | Sign Up | `(auth)/sign-up.tsx` | Email + password signup | writes auth.users → trigger creates `profiles` |
| 7 | Sign In | `(auth)/sign-in.tsx` | Email + password login | reads auth |
| 8 | Home Dashboard | `(tabs)/index.tsx` | Yearly/monthly spend, active count, savings card, upcoming, full list | reads `subscriptions`, `profiles` |
| 9 | Calendar | `(tabs)/calendar.tsx` | Monthly grid, colored renewal dots, logos, legend, filter | reads `subscriptions` |
| 10 | AI Advisor | `(tabs)/advisor.tsx` | Chat for saving advice (Gemini) | reads/writes `ai_messages` |
| 11 | Add Subscription | `subscription/add.tsx` (modal) | Search/pick brand grid, or add manually | brand constant |
| 12 | Entry Details | `subscription/new.tsx` (modal) | Full form: name, plan, dates, price, currency, period, payment, trial | writes `subscriptions` + schedules notif |
| 13 | Subscription Details | `subscription/[id].tsx` | Total paid, next payment, details, edit/delete | reads/updates/deletes `subscriptions` |
| 14 | Profile & Settings | `(tabs)/profile.tsx` | Profile card, preferences, account, support, sign out, delete | reads/updates `profiles` |

**Navigation:** root `_layout` auth-gates. No session → `(onboarding)` → `(auth)`. Session → `(tabs)` (Home · Calendar · Advisor · Profile). `add` & `new` = modals; `[id]` = stack push. Onboarding shown once (flag in secure-store).

## 3. Data model (Supabase, all tables RLS-locked to owner)

### `profiles` — 1:1 with `auth.users`, auto-created by signup trigger
| column | type | notes |
|---|---|---|
| id | uuid PK | = auth.users.id |
| email | text | |
| full_name | text | nullable |
| avatar_url | text | nullable (Storage) |
| currency | text | app-wide, default `'EUR'` |
| language | text | default `'en'` |
| first_day_of_week | int2 | 0=Sun, 1=Mon (default 1) |
| notifications_enabled | bool | default true |
| notification_days_before | int2 | default 2 (options 1/2/3/7) |
| is_premium | bool | default false — cache only |
| created_at / updated_at | timestamptz | |

### `subscriptions` — many → profiles (cascade delete)
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles.id | |
| name | text | |
| plan_name | text | nullable |
| brand_key | text | nullable → `assets/brands/*.svg` |
| category | text | nullable |
| price | numeric(10,2) | |
| currency | text | per-sub, no FX conversion |
| billing_period | text | `weekly` \| `once` \| `monthly` \| `yearly` |
| start_date | date | |
| next_renewal_date | date | nullable (`once` = null) |
| payment_method | text | nullable |
| is_free_trial | bool | default false |
| trial_end_date | date | nullable |
| color | text | nullable |
| notes | text | nullable |
| notification_id | text | nullable — local notif handle |
| is_active | bool | default true |
| created_at / updated_at | timestamptz | |

### `ai_messages` — many → profiles (cascade delete)
| column | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles.id | |
| role | text | `user` \| `assistant` |
| content | text | |
| created_at | timestamptz | |

**Limits (server-side):** sub count checked against 5 for free; AI 5/day = count today's `role='user'` rows.

## 4. Key user flows

**Add a subscription:** Home "+" → `add` (search or brand grid, or "Add manually") → `new` form → validate → check free-tier sub limit → insert → compute `next_renewal_date` (date-fns, month-end safe; `once` = none) → schedule local reminder (`notification_days_before`) → back to Home.

**View calendar:** open Calendar tab → load month's subscriptions → compute renewal dates → render hand-built FlatList grid with colored dots (weekly pink / monthly purple / yearly red) + brand logos → legend + filter → tap a day to see that day's renewals.

**Use AI advisor:** open Advisor → load last 30 `ai_messages` → user sends question → check 5/day limit → Edge Function (auth via JWT) reads user's subs + last 10 messages, calls Gemini (key in server secret), returns reply → persist both messages. ⋮ menu → "Clear conversation".

## 5. Design tokens

**Colors:** Primary `#6C47D9` · Secondary `#8B5CF6` · Background `#F0EBFF` · Surface `#FFFFFF` · Text `#1A1A2E` · Muted `#6B7280` · Success `#10B981` · Error `#EF4444` · Warning/Trial `#F59E0B` · Dots: weekly `#EC4899`, monthly `#8B5CF6`, yearly `#EF4444`.
**Radius:** cards 16 · inputs/buttons 12 · pills 99. **Primary button height:** 56.
**Spacing:** 4 / 8 / 12 / 16 / 24 / 32 / 48. **Font:** system (SF Pro / Roboto).
**Icons:** Ionicons outlined, 22 lists / 24 nav; container circle `#EDE9F8`, 36×36, radius 10.

## 6. Scope

**v1 (MVP):**
- Email/password auth (no social login)
- Add/edit/delete subscriptions (free tier: 5)
- Home: monthly + yearly totals in app-wide currency (with "approx." label since no FX), active count, savings card, upcoming, full list
- Savings card: (a) free trials ending within 30 days, (b) monthly subs where yearly < monthly×12 — total + breakdown, tap to expand
- Calendar: hand-built FlatList grid, colored dots, logos, legend, filter
- AI Advisor: persisted chat, Gemini via Edge Function, 5/day free limit
- Local scheduled renewal reminders (global lead time, default 2 days)
- Profile & settings (currency, language, first day of week, notifications, change password, delete account)

**v2+ (future):**
- RevenueCat paywall + premium unlock
- Multi-currency with live FX conversion & mixed totals
- Per-subscription notification timing
- Social login (Apple/Google)
- Push notifications, widgets, shared/family plans, spending insights & charts

## 7. Risks & mitigation

| Risk | Level | Approach |
|---|---|---|
| Calendar date math | Medium | date-fns only; store plain `date`; clamp month-end; hand-built FlatList grid |
| Gemini key security | High | Supabase Edge Function; key in server secret; rate-limit server-side |
| RevenueCat paywall | Deferred | Needs EAS dev build (no Expo Go); `is_premium` cache, RevenueCat = truth |
| Local notifications | Low–Med | expo-notifications local only; store `notification_id`; request permission in context; iOS ~64 pending cap → schedule next occurrence per sub only; `once`/inactive get none |
