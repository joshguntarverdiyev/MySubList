export const HELP_CENTER = `For support, contact us at:
hello@mysublist.app

Common questions:

• How do I add a subscription?
Tap the + button on the Home screen.

• How does the AI Advisor work?
It reads your subscriptions and gives personalized saving advice.

• How do I cancel a subscription in the app?
Go to the subscription, tap Delete. Note: this removes it from MySubList only, not from the actual service.

• How do I upgrade to Premium?
Premium coming soon.`

const LAST_UPDATED = 'July 20, 2026'

export interface InfoEntry {
  title: string
  /** Plain-text body — used for simple entries like Help Center. */
  body?: string
  /** Short summary bullets — used for the legal entries. */
  bullets?: string[]
  /** Footer link that opens the full hosted document. */
  fullUrl?: string
  fullLabel?: string
  lastUpdated?: string
}

export const INFO: Record<'help' | 'terms' | 'privacy', InfoEntry> = {
  help: { title: 'Help Center', body: HELP_CENTER },
  terms: {
    title: 'Terms of Service',
    bullets: [
      'MySubList is a subscription tracking app',
      'Free plan: up to 5 subscriptions',
      'Premium: €3.99/mo or €29.99/yr via App Store',
      'You are responsible for your account security',
      'We can terminate accounts that violate our terms',
    ],
    fullUrl: 'https://mysublist.app/terms',
    fullLabel: 'Read full Terms of Service →',
    lastUpdated: LAST_UPDATED,
  },
  privacy: {
    title: 'Privacy Policy',
    bullets: [
      'We collect your email and subscription data only',
      'Your data is stored securely via Supabase',
      'We never sell your data to third parties',
      'AI Advisor uses your subscription data to give advice',
      'You can delete your account and all data anytime',
    ],
    fullUrl: 'https://mysublist.app/privacy',
    fullLabel: 'Read full Privacy Policy →',
    lastUpdated: LAST_UPDATED,
  },
}
