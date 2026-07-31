const LAST_UPDATED = 'July 20, 2026'
const HELP_LAST_UPDATED = 'July 21, 2026'

export interface FaqItem {
  q: string
  a: string
}

export interface ContactItem {
  label: string
  email: string
}

export const HELP_CONTACTS: ContactItem[] = [
  { label: 'General inquiries', email: 'hello@mysublist.app' },
  { label: 'Support & help', email: 'support@mysublist.app' },
  { label: 'Partnership & business', email: 'contact@mysublist.app' },
]

export const HELP_FAQS: FaqItem[] = [
  {
    q: 'How do I add, edit, or delete a subscription?',
    a: 'Tap the + button on the Home screen to add one. To edit or delete, open the subscription and use the options on its details screen.',
  },
  {
    q: 'How does the AI Advisor work and are there limits?',
    a: 'The AI Advisor reads your subscriptions and suggests ways to save. Free users get 5 messages per day; Premium users get 50 messages per day.',
  },
  {
    q: 'What is the difference between Free and Premium?',
    a: 'Free includes up to 5 subscriptions and 5 AI messages per day. Premium unlocks unlimited subscriptions and 50 AI messages per day for €3.99/mo or €29.99/yr.',
  },
  {
    q: 'How does currency and FX conversion work?',
    a: 'Pick your preferred currency in Profile settings. Subscriptions in other currencies are converted using recent exchange rates so your totals stay consistent.',
  },
  {
    q: 'How are calendar and renewal dates calculated?',
    a: 'We calculate the next renewal from each subscription’s start date and billing cycle. The Calendar tab shows upcoming renewals with color-coded dots.',
  },
  {
    q: 'Will I get notified before a renewal?',
    a: 'Yes. Enable notifications and set your reminder lead time in Profile settings to get a local alert before each renewal.',
  },
  {
    q: 'How is my data kept private and secure?',
    a: 'Your data is stored securely via Supabase and never sold to third parties. Auth tokens are kept in your device’s secure storage.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Profile, open your account, and use the delete option in the Danger Zone. This permanently removes your account and all associated data.',
  },
  {
    q: 'How do billing and payments work?',
    a: 'Premium is billed through the App Store or Google Play. Manage or cancel your plan anytime from your store account settings.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email support@mysublist.app for help, or use the contact addresses above for general and business inquiries. We aim to reply within a couple of days.',
  },
]

export interface InfoEntry {
  title: string
  /** Plain-text body — used for simple entries. */
  body?: string
  /** Short summary bullets — used for the legal entries. */
  bullets?: string[]
  /** FAQ accordion items — used for the Help Center. */
  faqs?: FaqItem[]
  /** Tappable contact rows — used for the Help Center. */
  contacts?: ContactItem[]
  /** Footer link that opens the full hosted document. */
  fullUrl?: string
  fullLabel?: string
  lastUpdated?: string
}

export const INFO: Record<'help' | 'terms' | 'privacy', InfoEntry> = {
  help: {
    title: 'Help Center',
    faqs: HELP_FAQS,
    contacts: HELP_CONTACTS,
    lastUpdated: HELP_LAST_UPDATED,
  },
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
