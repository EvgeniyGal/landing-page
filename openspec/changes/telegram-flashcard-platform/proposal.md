## Why

The public landing page has no product surface for generating vocabulary flashcards. Admins need invite-only accounts, a Telegram bot, and OpenAI-backed generation so invited learners can send a word and receive a teacher-style flashcard without a user web dashboard.

## What Changes

- Add email/password authentication with Auth.js (Credentials), Admin and User roles, invite-only account activation, and password reset via Mailgun.
- Add an admin-only dashboard to manage users/roles, Telegram bot token, OpenAI API key and model, and the flashcard generation prompt.
- Add admin-generated one-time Telegram connection links that bind a Telegram account to a platform user.
- Add a Telegram webhook that identifies linked users, calls OpenAI with the configured prompt and model, stores the flashcard, and replies in Telegram.
- Persist users, tokens, Telegram links, app settings, and generated flashcards in Neon Postgres via Drizzle ORM.
- Keep the existing marketing landing page and contact flow unchanged.

## Capabilities

### New Capabilities
- `email-password-auth`: Invite-only email/password accounts, admin/user roles, password reset, and session-gated admin access.
- `admin-platform-settings`: Admin UI to manage users, Telegram bot token, OpenAI key/model, and the editable flashcard prompt.
- `telegram-account-linking`: One-time connection tokens that securely associate a Telegram account with a platform user.
- `telegram-flashcard-generation`: Linked users send a word to the bot; OpenAI generates flashcard content that is stored and returned in Telegram.

### Modified Capabilities
- None.

## Impact

- Affected code: new App Router routes (`/login`, `/admin/*`, invite/reset/connect pages), Auth.js config, Drizzle schema/migrations, Telegram webhook, OpenAI client, Mailgun auth emails, `robots.ts`.
- New dependencies: `next-auth`, Drizzle ORM, Neon serverless driver, `openai`, shadcn/ui (admin only), password hashing, encryption helpers.
- Configuration: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `APP_ENCRYPTION_KEY`, `TELEGRAM_WEBHOOK_SECRET`, bootstrap admin env vars.
- Non-impact: landing sections, contact form, and Mailgun inquiry flow remain as-is.
