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

- **Production APK / real users:** `EXPO_PUBLIC_API_URL=https://aiautomations.work` (also baked into EAS `preview` / `production` profiles in `eas.json`)
- Physical device + local API: your PC LAN IP (e.g. `http://192.168.31.160:3000`)
- iOS simulator / web on same machine: `http://localhost:3000`
- Android emulator → host: `http://10.0.2.2:3000`

Release builds default to `https://aiautomations.work` when `EXPO_PUBLIC_API_URL` is unset.

After changing `.env`, restart Expo so `EXPO_PUBLIC_*` is picked up.

### Google sign-in (mobile)

Set the same OAuth Web client ID as server `AUTH_GOOGLE_ID`, plus Android/iOS client IDs in `.env`:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (package `com.yg.flashcards`)
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

On the server, add matching `AUTH_GOOGLE_ANDROID_CLIENT_ID` / `AUTH_GOOGLE_IOS_CLIENT_ID` so `/api/v1/auth/google` accepts mobile id tokens.

For EAS builds, add those `EXPO_PUBLIC_*` values under `build.preview.env` / `build.production.env` in `eas.json` or as EAS secrets.

Start the Next.js API separately from the repo root (`npm run dev`), then:

```bash
npm start
```

Press `a` for Android or `i` for iOS (macOS + Xcode).

## Features

- Email/password login (`POST /api/v1/auth/login`) and Google (`POST /api/v1/auth/google`)
- Secure token storage (`expo-secure-store`)
- Dictionaries: list / create / delete
- Deck detail, AI add card, study (SM-2 ratings), edit card
- TTS playback via `/api/audio/...` with Bearer auth

## Notes

- Account invite/activation links remain web-only.
- Do not commit secrets; use `EXPO_PUBLIC_*` for API URL and Google client IDs only.
