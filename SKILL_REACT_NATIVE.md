# SKILL — React Native / Expo Patterns (MySubList)

Mobile-first engineering rules. Managed Expo SDK 57 only — never eject, never manual native linking without asking.

## 1. Safe areas

- Wrap the app in `SafeAreaProvider` (root `_layout`).
- Use `useSafeAreaInsets()` — **never hardcode** notch/home-indicator padding.
- Prefer applying `insets.top` / `insets.bottom` as padding on scroll containers rather than wrapping everything in `SafeAreaView`, so lists can scroll under the status bar edge-to-edge while content stays clear.
- Bottom CTAs: `paddingBottom: insets.bottom + 16`. Tab screens: add bottom inset so the last list item clears the tab bar.

## 2. Lists & performance

- Always `FlatList`/`SectionList` for any list that can grow (subscriptions, chat, brand grid) — never `.map()` in a ScrollView.
- Give stable `keyExtractor` (row `id`). Memoize row components with `React.memo`; keep `renderItem` referentially stable (`useCallback`).
- Set `initialNumToRender`, `windowSize`, and `removeClippedSubviews` for long lists. Avoid inline arrow functions creating new objects each render.
- **Calendar grid (hand-built):** render weeks as `FlatList` data (array of 6 week-rows, each 7 days) or a single `FlatList numColumns={7}`. Precompute renewal dots per day in `useMemo` keyed on month + subscriptions — never recompute inside `renderItem`.
- Chat list: `inverted` FlatList so newest is at bottom and it auto-sticks; load last 30 on open.

## 3. Gestures & touch

- Use `react-native-gesture-handler` primitives (already in stack). Wrap root in `GestureHandlerRootView`.
- Use `Pressable` with visible pressed state over bare `TouchableOpacity`. Touch targets ≥ 44×44.
- Modals (`add`, `new`) use Expo Router `presentation: 'modal'`; allow swipe-to-dismiss but confirm before discarding an unsaved form.

## 4. Keyboard handling (forms + chat)

- `KeyboardAvoidingView` with `behavior="padding"` (iOS) / `"height"` (Android), or `keyboardVerticalOffset` tuned per screen.
- Forms in a `ScrollView` with `keyboardShouldPersistTaps="handled"`. Chat input pinned above keyboard.
- Dismiss keyboard on scroll (`keyboardDismissMode="on-drag"`). Use correct `keyboardType`/`autoCapitalize` (email, decimal-pad for price).

## 5. iOS vs Android differences

- **Shadows:** iOS `shadowColor/Opacity/Radius`; Android needs `elevation`. NativeWind `shadow-sm` maps both — verify on both.
- **Status bar:** set `expo-status-bar` style per screen (dark content on light bg).
- **Fonts:** system = SF Pro (iOS) / Roboto (Android); don't assume identical metrics — test truncation.
- **Ripple vs opacity:** Android ripple via `android_ripple` on Pressable; iOS opacity. 
- **Back gesture:** Android hardware back must work on modals; `predictiveBackGestureEnabled` is off — test navigation.
- **Notifications:** Android 13+ (API 33) requires runtime POST_NOTIFICATIONS permission; iOS prompts separately. Request in context (after user opts into reminders), not on launch.

## 6. Data, storage & secrets

- **expo-secure-store** for auth tokens / anything sensitive — never AsyncStorage. Note: secure-store values are string-only and size-limited (keep to tokens/flags, not big blobs).
- Supabase session persisted via secure-store adapter. Onboarding-seen flag can live in secure-store too.
- **expo-image** for all images (brand SVG logos, 3D welcome icons) — never RN `Image`. Use `contentFit` and placeholders.
- Never put the Gemini key in the app — it lives in the Supabase Edge Function secret. The app only calls the function with the user's JWT.

## 7. Dates & notifications

- **date-fns** for all date math. Store/compare plain `date` (no time) to avoid timezone drift. Clamp month-end when adding months (Jan 31 + 1mo → Feb 28/29).
- `next_renewal_date`: compute forward from `start_date` by period; `once` = null (no renewal, no dot, no reminder).
- Local notifications: `scheduleNotificationAsync` only; store returned id in `subscriptions.notification_id`; cancel/reschedule on edit/delete. Reschedule using global `notification_days_before`. iOS ~64 pending cap → schedule only the next occurrence per sub.

## 8. General

- TypeScript strict — type Supabase rows in `src/types`, no `any`.
- `async/await` only, wrap network/db in try/catch with user-facing error + retry.
- Components < 150 lines; extract hooks (`useSubscriptions`) and pure helpers (`utils`).
- After installing native/Expo packages: `npx expo install …` then `npx expo start --clear`.
- Test on a real device via Expo Go during dev (dev build only needed once we add RevenueCat).
