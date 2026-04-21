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

3. Fill these required values:
- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
npm run lint
npm run test:contact
```

## Contact Flow

- `POST /api/contact` validates payload with Zod
- Server-side Mailgun SDK sends inquiry notifications
- Secrets remain on the server via environment variables
