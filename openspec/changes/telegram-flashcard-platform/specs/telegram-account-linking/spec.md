## Purpose

Lets an admin generate a one-time connection link so a platform user can open Telegram and securely bind their Telegram account to their invited account.

## ADDED Requirements

### Requirement: Admin generates a unique connection token
The system SHALL let an admin generate a unique, time-limited connection token for a specific user and return a shareable URL. The raw token MUST be stored only as a hash.

#### Scenario: Admin creates a connect link
- **WHEN** an admin requests a Telegram connection link for a user
- **THEN** the system returns a URL containing a one-time token bound to that user

### Requirement: User opens the link and starts the bot
The system SHALL present a public connection page for a valid token that directs the user to the Telegram bot with the token as the start payload. An expired or used token MUST be rejected.

#### Scenario: Valid token shows Telegram CTA
- **WHEN** the user opens a valid unused connection URL
- **THEN** the page offers a link to `t.me/{botUsername}?start={token}`

#### Scenario: Invalid token is rejected
- **WHEN** the user opens an expired, used, or unknown token URL
- **THEN** the system shows that the link is invalid and does not start linking

### Requirement: Telegram start payload binds accounts uniquely
When the bot receives `/start` with a valid token, the system MUST associate that Telegram user id with the token’s platform user, consume the token, and refuse if either side is already linked to a different account. Relinking MUST require an admin to disconnect first.

#### Scenario: Successful link
- **WHEN** a Telegram user starts the bot with a valid unused token and neither account is already linked
- **THEN** the system stores the Telegram user id on that platform user and confirms the link in Telegram

#### Scenario: Telegram account already linked
- **WHEN** a Telegram user starts the bot with a valid token but that Telegram id is already linked to another user
- **THEN** the system does not reassign the link and replies that the Telegram account is already connected

#### Scenario: Platform user already linked
- **WHEN** a Telegram user starts the bot with a token for a platform user who already has a Telegram connection
- **THEN** the system does not replace the existing connection unless an admin disconnected it first

### Requirement: Unlinked senders are refused
The system SHALL ignore flashcard generation for Telegram senders that are not linked to a platform user and MUST reply that the bot is invite-only.

#### Scenario: Unknown sender messages the bot
- **WHEN** an unlinked Telegram user sends a text message
- **THEN** the bot replies that they must use an invitation connection link and does not call OpenAI
