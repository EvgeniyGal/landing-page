## Purpose

OpenAI returns a typed flashcard payload that clients can render, speak, and schedule.

## ADDED Requirements

### Requirement: Structured generation
When a linked user or authenticated learner submits a word, `word-pos`, or phrase, the system MUST call OpenAI with a JSON schema and persist word, part of speech, IPA, irregular forms, three examples, and definition.

#### Scenario: Simple word
- **WHEN** the input is `abolish`
- **THEN** the stored card includes a word, transcription, three example sentences, and a definition

#### Scenario: Part of speech
- **WHEN** the input is `jump-verb`
- **THEN** generation targets that part of speech

### Requirement: Telegram still receives readable text
The system MUST also store a formatted `outputText` and send that text in Telegram so existing clients keep a front/back card layout.

#### Scenario: Telegram reply
- **WHEN** generation succeeds for a Telegram user
- **THEN** the bot replies with formatted front and back text, not raw JSON
