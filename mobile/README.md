# Expo learner app

React Native (Expo) client for the flashcard platform. Talks to the Next.js `/api/v1` Bearer JWT API.

## Setup

```bash
cd mobile
npm install
```

Copy env example and set the API base URL:

```bash
cp .env.example .env
```

- Physical device / Expo Go: use your computer's LAN IP (same as in the Metro URL, e.g. `exp://192.168.31.160:8082` → `EXPO_PUBLIC_API_URL=http://192.168.31.160:3000`)
- Local Next.js on the same machine (web / iOS simulator): `EXPO_PUBLIC_API_URL=http://localhost:3000`
- Android emulator accessing host machine: `http://10.0.2.2:3000`

After changing `.env`, restart Expo (`r` in the terminal, or stop and `npm start` again) so `EXPO_PUBLIC_*` is picked up.

Start the Next.js API separately from the repo root (`npm run dev`), then:

```bash
npm start
```

Press `a` for Android or `i` for iOS (macOS + Xcode).

## Features

- Email/password login (`POST /api/v1/auth/login`)
- Secure token storage (`expo-secure-store`)
- Dictionaries: list / create / delete
- Deck detail, AI add card, study (SM-2 ratings), edit card
- TTS playback via `/api/audio/...` with Bearer auth

## Notes

- Invite/activation and Google sign-in remain web-only for this MVP.
- Do not commit secrets; only `EXPO_PUBLIC_API_URL` is needed in the mobile app.
