## Purpose

After a Telegram account is linked, the user can send a word to the bot and receive generated flashcard content from the configured OpenAI model and prompt.

## ADDED Requirements

### Requirement: Linked user word triggers generation
When a linked user sends a non-command text message, the system MUST identify the platform user by Telegram user id, send the word plus the current prompt to OpenAI using the selected model, persist the generated flashcard, and reply with the model output in Telegram.

#### Scenario: Linked user sends a word
- **WHEN** a linked user sends a word such as `abolish`
- **THEN** the system calls OpenAI with the stored prompt and word, stores the result, and sends the flashcard text back in Telegram

#### Scenario: Linked user sends word and part of speech
- **WHEN** a linked user sends text such as `jump-verb`
- **THEN** the system forwards that input with the prompt so the model can target that part of speech

### Requirement: Generation requires complete configuration
If the Telegram bot token, OpenAI key, model, or prompt is missing, the system MUST NOT call OpenAI and MUST tell the user that the bot is not configured.

#### Scenario: OpenAI is not configured
- **WHEN** a linked user sends a word and no OpenAI key or model is stored
- **THEN** the bot replies that generation is unavailable and no flashcard is stored

### Requirement: Flashcards are stored per user
The system SHALL store each generated flashcard with the platform user, original input text, model output, model name, and the prompt used at generation time.

#### Scenario: Flashcard is persisted
- **WHEN** OpenAI returns flashcard content
- **THEN** the system writes a flashcard record associated with that user before or as it replies in Telegram

### Requirement: Telegram replies stay within message limits
If generated content exceeds Telegram’s message length limit, the system MUST split the reply into multiple messages rather than failing silently.

#### Scenario: Long flashcard is split
- **WHEN** OpenAI returns text longer than Telegram’s maximum message length
- **THEN** the bot delivers the content as sequential messages covering the full output
