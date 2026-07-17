export const HELP_CENTER = `For support, contact us at:
support@mysublist.com

Common questions:

• How do I add a subscription?
Tap the + button on the Home screen.

• How does the AI Advisor work?
It reads your subscriptions and gives personalized saving advice.

• How do I cancel a subscription in the app?
Go to the subscription, tap Delete. Note: this removes it from MySubList only, not from the actual service.

• How do I upgrade to Premium?
Premium coming soon.`

export const TERMS = `Last updated: July 2026

By using MySubList you agree to these terms. MySubList is provided as-is for personal subscription tracking. We are not responsible for missed payments or subscription charges. All data is stored securely via Supabase. You can delete your account and all data at any time from Profile Settings.`

export const PRIVACY = `Last updated: July 2026

What we collect:
• Your email address (for login)
• Subscription data you enter
• AI chat messages

What we do not collect:
• Payment card details
• Real financial account access

Your data is stored in Supabase (EU servers). We do not sell your data to third parties. You can delete all your data from settings.`

export const INFO = {
  help: { title: 'Help Center', body: HELP_CENTER },
  terms: { title: 'Terms of Service', body: TERMS },
  privacy: { title: 'Privacy Policy', body: PRIVACY },
} as const
