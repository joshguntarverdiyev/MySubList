# MySubList — Auth Email Templates

Branded, responsive HTML for every Supabase Auth email. Designed to look like a
premium SaaS product (Notion / Stripe / Linear style) instead of Supabase's
default plain templates.

## Files

| File | Supabase template | Key variables |
|---|---|---|
| `confirmation.html` | Confirm signup | `{{ .ConfirmationURL }}` |
| `recovery.html` | Reset password | `{{ .ConfirmationURL }}` |
| `email-change.html` | Change email | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` |
| `magic-link.html` | Magic Link | `{{ .ConfirmationURL }}` |
| `invite.html` | Invite user | `{{ .ConfirmationURL }}` |

All five share the same design tokens (kept identical across files since Supabase
templates can't import partials):

- Page background `#F8F8F8`, white card `#FFFFFF`, radius `16px`, max-width `560px`
- Brand purple `#7C4DFF` (hover `#6B3FE0`) — matches the app
- Text `#111111`, muted `#6B7280` / `#9CA3AF`, divider `#ECECEF`
- CTA button: 48px tall, rounded `12px`, white text, MSO/VML fallback for Outlook
- System font stack, hidden preheader, mobile-first `@media (max-width:600px)`,
  inline styles, table layout — renders in Gmail, Outlook, Apple Mail, iOS Mail

## 1. Set the logo URL (required)

Each file references the header logo as:

```html
<img src="https://mysublist.app/logo.png" width="48" height="48" alt="MySubList" ... />
```

Replace that URL with a **public HTTPS** PNG (~96×96 for retina). Easiest option:
upload `assets/logo.png` to a public Supabase Storage bucket and use its public
URL. Find & replace `https://mysublist.app/logo.png` in all five files.

> Tip: also update the `https://mysublist.app/privacy` and `/terms` footer links
> and `support@mysublist.app` if those differ.

## 2. Install the templates

### Hosted project (production) — required
The hosted Supabase project does **not** read these files. Paste each one:

1. Supabase Dashboard → **Authentication → Email Templates**.
2. Pick a template (Confirm signup, Invite, Magic Link, Change Email, Reset
   Password), open the **Source/HTML** editor, and paste the matching file's
   contents. Set the **Subject** (see the table above / `config.toml`).
3. Save. Repeat for all five.

### Local dev (`supabase start`) — already wired
`supabase/config.toml` now points each `[auth.email.template.*]` at these files,
so local auth emails use them automatically. To sync file-based config to the
linked project (CLI-managed setups only): `supabase config push`.

## 3. Resend (email delivery)

These templates are just the **HTML body** — delivery is unchanged. Confirm
Resend is set as Supabase's SMTP sender:

- Dashboard → **Project Settings → Authentication → SMTP Settings** →
  Host `smtp.resend.com`, Port `465`, User `resend`, Password = your Resend API
  key, Sender = a **verified domain** address (e.g. `no-reply@mysublist.app`).
- In Resend, verify the sending domain (SPF/DKIM) so these don't land in spam.

No template changes are needed on the Resend side — Supabase renders the HTML
(substituting `{{ .ConfirmationURL }}` etc.) and hands it to Resend to send.

## 4. Test

- Trigger each flow from the app (sign up, reset password, change email).
- Preview in Gmail + Apple Mail + Outlook. Paste into a tool like
  [litmus.com](https://litmus.com) or [emailonacid.com](https://www.emailonacid.com)
  for a full client matrix if you want extra confidence.
