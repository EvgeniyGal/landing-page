## Purpose

On-demand speech for the headword and each example, stored on Vercel Blob.

## ADDED Requirements

### Requirement: Get or create audio
When the user requests audio for a kind, the system MUST return the existing Blob URL if present; otherwise it MUST call ElevenLabs, upload an mp3 to Vercel Blob, and store the URL.

#### Scenario: First play
- **WHEN** the word audio does not exist
- **THEN** the system generates TTS, uploads to Blob, and returns the URL

#### Scenario: Second play
- **WHEN** the same kind is requested again
- **THEN** the system does not call ElevenLabs

### Requirement: Optional TTS
If ElevenLabs is not configured, card creation MUST still succeed and audio endpoints MUST fail clearly.

#### Scenario: Missing key
- **WHEN** `ELEVENLABS_API_KEY` is unset and audio is requested
- **THEN** the API returns 503 and Telegram omits voice buttons
