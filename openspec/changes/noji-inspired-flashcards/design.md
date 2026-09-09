## Context

The repo already has invite-only Auth.js credentials, admin OpenAI/Telegram settings, and Telegram generation that stores freeform `outputText`. This change turns that store into a spaced-repetition product with a web UI and a mobile-ready API.

## Goals / Non-Goals

**Goals:**
- Structured JSON cards, SM-2 study, Blob TTS, Google linking, learner `/app`, `/api/v1`.
- Telegram creation keeps working; cards go to the user’s default deck.

**Non-Goals:**
- FSRS, native mobile app, bulk import, folders, reverse cards, rich-text editor, public signup, admin UI for ElevenLabs/Blob.

## Decisions

### 1) Shared services, multiple clients
Telegram, Server Actions, and `/api/v1` call the same functions (`createFlashcardForUser`, `getOrCreateAudio`, `listDecksForUser`, `getDueCards`, `reviewCard`).

### 2) OpenAI JSON schema + pedagogical admin prompt
System message + `response_format` json_schema; admin prompt stays editable teaching instructions.

### 3) Vercel Blob is the only media store
`put` public mp3s at `flashcards/{userId}/{cardId}/{kind}.mp3`. Postgres stores `blobUrl`. Telegram `sendAudio` uses the public URL.

### 4) Invite-only Google linking
Lookup user by normalized email. Unknown/disabled → reject. Invited → activate. Upsert `oauth_accounts`. JWT `sub` is the platform user id.

### 5) API JWT separate from cookie session
`jose` HS256 tokens signed with `AUTH_SECRET`. Mobile sends Google `idToken`; server verifies against Google JWKS / tokeninfo and applies the same linking rules.

### 6) SM-2 language preset
Steps `1m 10m`, graduate `1d`, easy `4d`, ease `2.5`, easy bonus `1.3`, hard `1.2`, floor `1.3`. New cards are due immediately.

### 7) Learner UI is dark and isolated
`/app` uses a Noji-inspired dark shell. Landing stays the existing light marketing theme. FLUX textures in `public/app/` with CSS fallback.

## Risks

- Webhook timeout on TTS → generate one clip per callback; “all examples” sequentially.
- Admin prompt vs JSON → schema enforcement ignores freeform “return only text” instructions.
- Existing freeform rows → backfill `word` from `inputText`; they remain studyable but may lack examples.
