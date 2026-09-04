# AI Automation Landing Page

Next.js landing page implementation based on the requirement assets in `requarenments/`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill required values for the landing contact form:
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

4. For the admin flashcard platform, also set:
- `DATABASE_URL` (Neon Postgres)
- `AUTH_SECRET`
- `AUTH_URL`
- `APP_ENCRYPTION_KEY`
- `TELEGRAM_WEBHOOK_SECRET`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

5. Apply migrations and create the first admin:

```bash
npm run db:migrate
npm run db:seed-admin
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run test:contact
npm run test:seo
npm run test:platform
```

## Admin platform

- Sign in at `/login` (admin only dashboard at `/admin`)
- Invite users by email; they activate at `/invite/[token]`
- Save a Telegram bot token and OpenAI key in the admin settings
- Generate a Telegram connection link per user; the bot webhook is `/api/telegram/webhook`

## Contact Flow

- `POST /api/contact` validates payload with Zod
- Server-side Mailgun SDK sends inquiry notifications
- Secrets remain on the server via environment variables
