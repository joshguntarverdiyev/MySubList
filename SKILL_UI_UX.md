# SKILL — UI/UX (MySubList)

Design intelligence for every screen. Goal: clean, modern, premium, trustworthy — like a well-designed finance app. When in doubt, choose calm over busy, whitespace over density.

## 1. Tokens → NativeWind

Define these in `tailwind.config.js` so classes read semantically. Never hardcode hex in components.

```
colors:  primary #7C4DFF · secondary #8B5CF6 · background #F0EBFF · surface #FFFFFF
         text #1A1A2E · muted #6B7280 · success #10B981 · error #EF4444 · warning #F59E0B
         dot-weekly #EC4899 · dot-monthly #8B5CF6 · dot-yearly #EF4444 · icon-bg #EDE9F8
radius:  card 16 (rounded-2xl) · input/button 12 (rounded-xl) · pill 99 (rounded-full)
```

Spacing scale = **4 / 8 / 12 / 16 / 24 / 32 / 48** only. In Tailwind: `1=4, 2=8, 3=12, 4=16, 6=24, 8=32, 12=48`. Never invent in-between values (no `p-5`, no `mt-[13px]`).

## 2. Typography scale

| Role | Size / weight | Class | Use |
|---|---|---|---|
| Display | 32 / 700 | `text-[32px] font-bold text-text` | big spend numbers |
| Title | 24 / 700 | `text-2xl font-bold text-text` | screen headers |
| Section | 18 / 600 | `text-lg font-semibold text-text` | card headings |
| Body | 16 / 400 | `text-base text-text` | default |
| Label | 14 / 500 | `text-sm font-medium text-text` | form labels, list titles |
| Caption | 12 / 400 | `text-xs text-muted` | subtitles, meta |

Numbers (prices, totals) use `font-semibold` and tabular feel. Currency always formatted via `utils` (never string-concatenated).

## 3. Core component patterns

**Card** — white surface on lavender bg:
`bg-surface rounded-2xl p-4 shadow-sm` (soft shadow, low elevation). Cards float on `bg-background`.

**Primary button** — height 56, full radius-12:
`h-14 rounded-xl bg-primary items-center justify-center` + text `text-white font-semibold text-base`. Pressed: `active:opacity-90`. Disabled: `opacity-40`. Secondary button = `bg-icon-bg` with `text-primary`.

**Pill / tag** — `rounded-full px-3 py-1`. Trial tag = `bg-warning/15 text-warning`; Active = `bg-success/15 text-success`.

**Icon container** (the signature circle): `w-9 h-9 rounded-[10px] bg-icon-bg items-center justify-center` with Ionicon 22px in `primary`. Reuse everywhere an icon leads a row.

**List row** — icon container + title/caption stack + trailing value/chevron:
`flex-row items-center gap-3 py-3`. Titles `text-sm font-medium`, captions `text-xs text-muted`.

**Stat card** (Home totals) — label caption on top, big display number below, optional delta pill. Monthly/yearly totals show a small **"approx."** caption (no FX in v1).

**Billing dot** — `w-2.5 h-2.5 rounded-full` colored by period: weekly `bg-dot-weekly`, monthly `bg-dot-monthly`, yearly `bg-dot-yearly`. `once` shows no dot.

**Chat bubble** — user: `self-end bg-primary rounded-2xl rounded-br-md px-4 py-3` white text. AI: `self-start bg-surface rounded-2xl rounded-bl-md px-4 py-3` text-text. Max width ~80%.

## 4. Spacing & layout rules

- Screen horizontal padding: **16** (`px-4`). Section gaps: **24** (`gap-6`).
- Between cards in a list: **12** (`gap-3`). Inside a card: **16** (`p-4`).
- Never let content touch screen edges or the notch (safe-area handled — see RN skill).
- One primary action per screen. CTAs pinned bottom with safe-area padding.

## 5. Animation standards (Moti + Reanimated)

- **Purposeful, subtle, fast.** Durations 150–300ms. Easing: standard ease-out for enters.
- Screen/list item entrance: fade + 8–12px translateY, staggered ~40ms for lists.
- Press feedback: `active:opacity-90` or slight scale (0.98). No bouncy springs on finance data.
- Splash → app: gentle crossfade. Numbers may count-up on Home (optional, ≤400ms).
- Respect reduce-motion; never block interaction on animation.

## 6. Visual quality bar (check every screen)

- [ ] Matches the Figma frame (read it before building — layout, spacing, hierarchy).
- [ ] Only token colors/spacing/radius used; no stray hex or off-scale spacing.
- [ ] Clear hierarchy: one focal element, muted secondary text.
- [ ] Empty states designed (no subs, no messages, no renewals this month).
- [ ] Loading (skeleton/spinner) and error states present.
- [ ] Touch targets ≥ 44px; disabled/pressed states visible.
- [ ] Safe areas respected top and bottom; scrolls clear the tab bar.
- [ ] Looks premium on both a small phone and a large one.
