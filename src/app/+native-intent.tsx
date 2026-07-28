// Expo Router runs this for every incoming deep link BEFORE it tries to match a
// route. Supabase auth links (mysublist://confirmed | reset-password |
// email-changed) don't map to any screen, so without this they'd render the
// built-in "Unmatched Route" page for a beat while our async handler caught up.
// We rewrite all three to the single /auth-callback screen, passing the original
// URL through as a param — the session tokens live in its `#` fragment, which
// that screen parses to finish the auth exchange. Any other path is left as-is.
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    const flow = path.includes('reset-password')
      ? 'reset'
      : path.includes('email-changed')
        ? 'email-changed'
        : path.includes('confirmed')
          ? 'confirmed'
          : null
    if (!flow) return path
    return `/auth-callback?flow=${flow}&u=${encodeURIComponent(path)}`
  } catch {
    // Never throw here — Expo Router docs warn it can crash the app.
    return path
  }
}
