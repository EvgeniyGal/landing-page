## 1. Foundation

- [x] 1.1 Add NextAuth, Drizzle, Neon, openai, bcryptjs, and admin UI dependencies; extend `.env.example`; verify `npm install` succeeds
- [x] 1.2 Create Drizzle schema, config, migrations, db client, and AES-256-GCM encryption helper; verify schema exports compile
- [x] 1.3 Add bootstrap admin seed script and npm scripts for drizzle generate/migrate/seed; verify the script is idempotent when the email exists

## 2. Authentication

- [x] 2.1 Implement Auth.js Credentials config (active users only, JWT with role) and `/api/auth/[...nextauth]` route
- [x] 2.2 Add middleware protecting `/admin/**` for admins, redirecting unauthenticated visitors to `/login`, and blocking role `user`
- [x] 2.3 Build login, forgot-password, reset-password, and invite-accept pages plus Mailgun invite/reset emails; verify Zod validation on those forms
- [x] 2.4 Update `robots.ts` to disallow `/admin`, `/login`, `/invite`, `/connect`, and `/forgot-password`

## 3. Admin Dashboard

- [x] 3.1 Scaffold shadcn/ui admin layout with nav for Users, Bot, OpenAI, and Prompt
- [x] 3.2 Implement user list, invite-by-email, role change, disable/enable, and Telegram disconnect actions
- [x] 3.3 Implement Telegram bot token save (getMe, setWebhook, encrypted store, last-4 display)
- [x] 3.4 Implement OpenAI key save, model dropdown from `/v1/models`, and persisted model selection
- [x] 3.5 Implement editable flashcard prompt with the default teacher template prefilled

## 4. Telegram And Generation

- [x] 4.1 Implement connect-link generation and `/connect/telegram/[token]` page with `t.me` deep link
- [x] 4.2 Implement webhook: secret header, `/start` linking with uniqueness rules, invite-only reply for unlinked senders
- [x] 4.3 Implement word → OpenAI → persist flashcard → Telegram reply (split over 4096 chars); verify unit tests with mocked Telegram/OpenAI
- [x] 4.4 Confirm landing page `/` and `POST /api/contact` still work; run lint and existing tests
