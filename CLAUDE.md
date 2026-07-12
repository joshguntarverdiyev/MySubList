@AGENTS.md

# MySubList — Project Guide

Always follow the product plan in **PRD.md** and the connected **SKILL_UI_UX.md** and **SKILL_REACT_NATIVE.md** skill files.

MySubList helps users track digital subscriptions, see renewals on a calendar, and get AI-powered saving advice. Freemium (RevenueCat): free = 5 subs + 5 AI messages/day; premium (€3.99/mo, €29.99/yr) = unlimited.

---

## Tech stack — use exactly this, never add/change without asking

- **Framework:** React Native + Expo **SDK 57**, managed workflow only — never eject
- **Language:** TypeScript, strict mode
- **Navigation:** Expo Router v3 — file-based, all screens in `src/app` (NOT `app`)
- **Styling:** NativeWind v4 — Tailwind classes only, never `StyleSheet.create`
- **Backend:** Supabase — auth, Postgres, storage
- **AI:** Google Gemini via a **Supabase Edge Function** (key stays server-side)
- **State:** Zustand
- **Secure storage:** expo-secure-store (never AsyncStorage for sensitive data)
- **Images:** expo-image (never RN built-in `Image`)
- **Icons:** @expo/vector-icons (Ionicons)
- **Animation:** Reanimated (SDK 57 ships v4) + Moti
- **Dates:** date-fns (only non-stack package; pure JS)
- **Notifications:** expo-notifications — local scheduled only
- **Payments:** RevenueCat (paywall step — later, needs dev build)
- **Build:** EAS Build + Submit (later). OTA: Expo Updates (later)

Install Expo/native packages with `npx expo install` — never plain `npm install`. After any install, run `npx expo start --clear`.

---

## Screens (14) — file paths in `src/app`

| # | Screen | Path |
|---|---|---|
| 1 | Splash | native splash + `index.tsx` loading state |
| 2 | Welcome | `(onboarding)/welcome.tsx` |
| 3 | Onboarding 1 — ghost costs | `(onboarding)/step-1.tsx` |
| 4 | Onboarding 2 — calendar | `(onboarding)/step-2.tsx` |
| 5 | Onboarding 3 — AI | `(onboarding)/step-3.tsx` |
| 6 | Sign Up | `(auth)/sign-up.tsx` |
| 7 | Sign In | `(auth)/sign-in.tsx` |
| 8 | Home Dashboard | `(tabs)/index.tsx` |
| 9 | Calendar | `(tabs)/calendar.tsx` |
| 10 | AI Advisor | `(tabs)/advisor.tsx` |
| 11 | Add Subscription (modal) | `subscription/add.tsx` |
| 12 | Entry Details (modal) | `subscription/new.tsx` |
| 13 | Subscription Details | `subscription/[id].tsx` |
| 14 | Profile & Settings | `(tabs)/profile.tsx` |

**Navigation:** root `_layout` auth-gates → no session: `(onboarding)`/`(auth)`; session: `(tabs)`. Tabs = Home · Calendar · Advisor · Profile. `add`/`new` are modals; `[id]` is a stack push.

---

## Folder rules

```
src/app/          routes ONLY (Expo Router)
src/components/    reusable UI (ui/, subscription/, calendar/, advisor/)
src/lib/          supabase client, gemini caller, notifications
src/store/        Zustand stores
src/constants/    design tokens, brand catalog, categories
src/hooks/        custom hooks
src/types/        TS types
src/utils/        date math, currency formatting, renewal calc
```

- Every component file **under 150 lines** — split if bigger.
- Import alias `@/*` → `src/*`.

---

## Design tokens

**Colors**
| Token | Hex |
|---|---|
| Primary | `#6C47D9` |
| Secondary | `#8B5CF6` |
| Background | `#F0EBFF` |
| Surface / Card | `#FFFFFF` |
| Text primary | `#1A1A2E` |
| Text muted | `#6B7280` |
| Success / Active | `#10B981` |
| Error | `#EF4444` |
| Warning / Trial | `#F59E0B` |
| Weekly dot | `#EC4899` (pink) |
| Monthly dot | `#8B5CF6` (purple) |
| Yearly dot | `#EF4444` (red) |

**Radius:** cards 16 · inputs/buttons 12 · tags/pills 99
**Button height:** primary 56
**Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48
**Font:** system (SF Pro iOS / Roboto Android) — modern, clean

**Icons:** Ionicons outlined. 22px in lists, 24px in nav. Icon container = circle bg `#EDE9F8`, 36×36, radius 10.

---

## Assets

- App icon: `assets/icon.png` (1024²) · Splash: `assets/splash.png`, bg `#6C47D9`
- Logo: `assets/logo.png`, `assets/logo.svg`
- Welcome 3D icons: `assets/welcome-screen/`
- Brand SVGs: `assets/brands/` (spotify, netflix, youtube, etc.)
- Screen reference art: `assets/home-screen/`, `assets/calendar-screen/`, `assets/ai-screen/`

---

## Coding rules

- Never write code until the user says **"approved, start coding"**.
- Build **one feature at a time**. Before coding a feature: list files to create/edit, then wait for OK.
- `async/await` only — never `.then()` chains.
- Ask before adding any library outside the stack.
- Use `useSafeAreaInsets` for safe areas — never hardcode notch padding.
- Read the matching Figma frame before building each screen.
- Use Context7 for live package docs before writing package code.

## Security rules

- Never hardcode API keys/secrets/tokens — always `.env`.
- Never touch Supabase auth logic or `.env` files without asking.
- Gemini key lives only in Supabase Edge Function secrets — never in the app bundle.
- All AI rate-limit and sub-count limits enforced server-side.
- Sensitive data (auth tokens) → expo-secure-store only.

## Workflow rules

- After every feature, remind the user to test on phone/simulator.
- After confirmation: `git add . && git commit -m "[feature name] working"`.
- Be token-efficient — never rewrite whole files for small fixes.
- When context gets long: summarize progress, then `/compact`.
- If unsure, ask — never guess.
