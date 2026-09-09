## Purpose

A Noji-inspired dark web app for invited learners to manage decks, add AI cards, and study.

## ADDED Requirements

### Requirement: Session-gated app
Unauthenticated visitors MUST be redirected to login. Role user MUST reach `/app`, not admin.

#### Scenario: User opens Home
- **WHEN** an active user with role user visits `/app`
- **THEN** they see their decks and Cards for today

### Requirement: AI add card
#### Scenario: Generate
- **WHEN** the user submits a word on Add card
- **THEN** the card is stored and Front/Back show structured fields with speaker controls when audio is available

### Requirement: Study session
#### Scenario: Reveal and rate
- **WHEN** the user starts study on a deck with due cards
- **THEN** they see the front, can tap to show the answer, and rating buttons apply SM-2
