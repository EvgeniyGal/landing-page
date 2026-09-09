## Why

Flashcards are generated as freeform Telegram text, with no structured fields, audio, study schedule, or learner web UI. Invited users need a Noji-style app to create JSON cards, hear pronunciation, and review with SM-2, while the same data stays available to Telegram and a future mobile client.

## What Changes

- Parse OpenAI output as structured JSON (word, IPA, three examples, definition) while keeping Telegram replies readable.
- Store decks, SM-2 scheduling state, review logs, and OAuth accounts in Postgres.
- Generate on-demand ElevenLabs speech, persist mp3s in Vercel Blob, and reuse URLs across web, Telegram, and API.
- Add invite-only Google sign-in linked to the same email as password login.
- Ship a dark learner web app (Home, add card, study session) inspired by the Noji snapshots, without cloning Noji branding.
- Expose versioned `/api/v1` endpoints (Bearer JWT) for a future mobile app.
- Keep existing Telegram word-to-card creation working, with optional voice buttons after generate.

## Capabilities

### New Capabilities
- `structured-flashcard-generation`: JSON schema generation, formatter, and typed flashcard fields.
- `sm2-scheduler`: Anki/Noji-style SM-2 with learning steps, due queues, and rating previews.
- `blob-tts`: ElevenLabs TTS cached on Vercel Blob per card audio kind.
- `google-account-linking`: Invite-only Google login; same email as credentials is the same user.
- `learner-web-app`: Session-gated Home, deck detail, AI add-card, and study UI.
- `mobile-v1-api`: Bearer JWT auth plus decks, cards, audio, and review routes.

### Modified Capabilities
- `telegram-flashcard-generation`: Persist structured cards into the default deck; optional TTS inline keyboard.
- `email-password-auth`: After login, learners go to `/app`; Google is an additional provider.

## Impact

- Schema/migrations for decks, flashcard columns, audio, reviews, OAuth accounts.
- New env: ElevenLabs, Blob, Google OAuth.
- Dependencies: `@vercel/blob`, `jose`.
- Landing page and contact flow unchanged.
