## Purpose

Telegram generation still works and can attach optional TTS.

## MODIFIED Requirements

### Requirement: Linked user word triggers generation
When a linked user sends a non-command text message, the system MUST generate a structured card, store it on the default deck with SM-2 `new` state, and reply with formatted text.

#### Scenario: Linked user sends a word
- **WHEN** a linked user sends `abolish`
- **THEN** the system stores a structured flashcard and sends formatted front/back text

### Requirement: Optional voice keyboard
If ElevenLabs is configured, the reply MUST include buttons to generate speech for the word, each example, or all examples.

#### Scenario: Voice for example
- **WHEN** the user taps example 1
- **THEN** the bot sends that clip via sendAudio using the Blob URL
