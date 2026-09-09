## 1. Schema and generation

- [x] 1.1 Extend Drizzle schema (decks, structured cards, SM-2, audio, review logs, oauth accounts) and add a SQL migration
- [x] 1.2 Add Zod card schema, OpenAI json_schema generate, formatter, and default prompt
- [x] 1.3 Implement SM-2 scheduler and due-count helpers with unit tests

## 2. Media and Telegram

- [x] 2.1 ElevenLabs TTS + Vercel Blob get-or-create audio
- [x] 2.2 Telegram inline keyboard, callback_query, sendAudio from Blob URL

## 3. Auth, API, web

- [x] 3.1 Google provider, email linking, login UI, `/app` redirects
- [x] 3.2 `/api/v1` auth, decks, flashcards, audio, study, review
- [x] 3.3 Learner Home, deck, add-card, study UI; FLUX or CSS textures
- [x] 3.4 Tests for auth linking, API, Blob cache, Telegram callbacks; env example
