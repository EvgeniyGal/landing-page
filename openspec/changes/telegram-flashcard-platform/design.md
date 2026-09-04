## Context

The repo is a Next.js 16 App Router marketing site (Tailwind, Mailgun contact API, no auth or database). See proposal.md for motivation. This change adds a single-tenant admin product beside the landing page: Auth.js credentials, Neon/Drizzle, Telegram Bot API webhooks, and OpenAI chat completions. Regular users have no dashboard in this change.

## Goals / Non-Goals

**Goals:**
- Keep `/` as the public landing page.
- Add invite-only identity, an admin dashboard, Telegram linking, and flashcard generation on one Neon database.
- Encrypt bot token and OpenAI key at rest; never send full secrets back to the browser.
- Use Mailgun (already present) for invite and password-reset emails.

**Non-Goals:**
- User-facing flashcard history or learner dashboard.
- Public registration, OAuth, or multi-tenant orgs.
- Polling the Telegram Bot API.
- Changing landing copy, contact flow, or visual marketing sections.

## Decisions

### 1) Auth.js v5 Credentials with JWT sessions
- **Decision**: Use `next-auth` Credentials provider and JWT sessions. Put `userId`, `role`, and `status` on the token. Protect `/admin/**` in Next.js middleware.
- **Why**: Credentials do not map cleanly to OAuth `accounts`; JWT avoids adapter session tables while still supporting role checks.
- **Alternatives considered**: Database sessions via Drizzle adapter (more revocation, more moving parts); Clerk/Auth0 (out of requested stack).

### 2) Neon + Drizzle schema-first
- **Decision**: PostgreSQL on Neon, Drizzle ORM, versioned SQL migrations. Users, hashed invite/reset/link tokens, telegram connections, singleton `app_settings`, and `flashcards`.
- **Why**: Matches the requested stack and keeps types aligned with queries.
- **Alternatives considered**: Prisma (not requested); env-only secrets (conflicts with dashboard-configured keys).

### 3) AES-256-GCM for dashboard secrets
- **Decision**: Encrypt Telegram token and OpenAI key with `APP_ENCRYPTION_KEY`. Admin UI shows configured vs not, plus last four characters after save.
- **Why**: Keys live in the database because admins set them in the UI; encryption limits dump exposure.
- **Alternatives considered**: Store only in env (no dashboard save); plaintext DB columns (rejected).

### 4) Telegram webhook + start payload linking
- **Decision**: On bot token save, call `getMe` and `setWebhook` to `/api/telegram/webhook` with `TELEGRAM_WEBHOOK_SECRET`. Connection URL is `{site}/connect/telegram/{rawToken}` which deep-links to `t.me/{bot}?start={token}`.
- **Why**: Serverless-friendly; the start payload is the standard way to bind a Telegram user without a login widget.
- **Alternatives considered**: Long polling (poor fit for Vercel); Telegram Login Widget (extra OAuth-style flow, still needs the bot for generation).

### 5) Prompt-driven generation, store raw text
- **Decision**: Send the admin prompt plus the user message to OpenAI (`{{word}}` substitution or append). Persist `inputText`, `outputText`, model, and prompt snapshot. Default prompt is the teacher front/back template.
- **Why**: Admins can change format anytime without a rigid JSON schema.
- **Alternatives considered**: Forced JSON `{front,back}` (breaks if the prompt changes).

### 6) shadcn/ui for admin only
- **Decision**: Add shadcn + Radix + lucide for `/admin` and auth pages. Leave landing components untouched.
- **Why**: Matches `requarenments/tack stack.md` without rewriting the marketing site.

### 7) First admin via seed script
- **Decision**: `npm run db:seed-admin` reads `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. Idempotent if that email already exists.
- **Why**: Safer than creating an admin on every server start.
- **Alternatives considered**: Empty-DB auto-seed in app boot (easy to misfire in production).

## Risks / Trade-offs

- **[Risk] OpenAI latency vs serverless limits** → Keep the webhook handler lean; return 200 after work when possible; surface a Telegram error message on timeout/API failure.
- **[Risk] Stolen invite or connect links** → Hash tokens, short TTL, single use.
- **[Risk] Webhook spoofing** → Require Telegram `X-Telegram-Bot-Api-Secret-Token` to match `TELEGRAM_WEBHOOK_SECRET`.
- **[Trade-off] JWT sessions** → Logout is client-side cookie clear; role changes apply on next token refresh/login.
- **[Trade-off] Single-tenant settings row** → Simple now; would need a redesign for multiple bots/orgs.

## Migration Plan

1. Add dependencies, Drizzle schema, and migrations; set `DATABASE_URL`.
2. Seed the bootstrap admin; confirm `/login` → `/admin`.
3. Configure Mailgun (existing) for invite/reset templates.
4. Save bot token and OpenAI key in admin; verify webhook with a test `/start`.
5. Invite a user, connect Telegram, send a word, confirm reply and DB row.

**Rollback strategy**: Remove admin/auth/webhook routes and drop new tables/migrations. Landing page and `/api/contact` remain independently deployable.

## Open Questions

None that block this change. User dashboard and flashcard history are deferred.
