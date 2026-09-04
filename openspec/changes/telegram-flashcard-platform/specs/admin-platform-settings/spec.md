## Purpose

Gives admins a dashboard to manage invited users and roles, connect a Telegram bot, store an OpenAI key, choose a model, and edit the flashcard generation prompt.

## ADDED Requirements

### Requirement: Admin can manage users and roles
The system SHALL let an authenticated admin list users with email, role, status, and Telegram link state. The admin MUST be able to invite users, change role between `admin` and `user`, and disable or re-enable accounts.

#### Scenario: Admin lists users
- **WHEN** an admin opens the users page
- **THEN** the system shows each user’s email, role, status, and whether Telegram is linked

#### Scenario: Admin changes a role
- **WHEN** an admin changes a user’s role
- **THEN** the system persists the new role and subsequent authorization uses it

### Requirement: Admin can store a Telegram bot token
The system SHALL let an admin save a Telegram bot token. On save, the system MUST validate the token, store the bot username, and register the webhook. The dashboard MUST NOT display the full stored token after save.

#### Scenario: Admin connects a bot
- **WHEN** an admin submits a valid bot token
- **THEN** the system stores the token encrypted, records the bot username, and registers the inbound webhook

#### Scenario: Invalid bot token is rejected
- **WHEN** an admin submits a token that Telegram rejects
- **THEN** the system does not persist the token and returns an error

### Requirement: Admin can configure OpenAI
The system SHALL let an admin save an OpenAI API key and select a model from a dropdown of models available for that key. The dashboard MUST NOT display the full stored key after save.

#### Scenario: Admin saves a key and sees models
- **WHEN** an admin submits a valid OpenAI API key
- **THEN** the system stores the key encrypted and presents a dropdown of available models

#### Scenario: Admin selects a model
- **WHEN** an admin chooses a model from the dropdown and saves
- **THEN** subsequent flashcard generation uses that model

### Requirement: Admin can edit the flashcard prompt
The system SHALL persist an editable flashcard generation prompt. The initial prompt MUST instruct a professional English teacher to produce a front/back flashcard (word, part of speech, IPA, three examples, irregular verb forms on the front; simple definition on the back) and to return only flashcard content. The admin MUST be able to update the prompt at any time.

#### Scenario: Prompt is prefilled
- **WHEN** an admin opens prompt settings before any custom edit
- **THEN** the system shows the default teacher flashcard prompt

#### Scenario: Admin updates the prompt
- **WHEN** an admin saves a new prompt
- **THEN** the next Telegram generation uses the updated prompt
