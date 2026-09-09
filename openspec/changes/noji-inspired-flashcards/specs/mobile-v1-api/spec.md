## Purpose

Versioned REST API so a future mobile app can authenticate and study.

## ADDED Requirements

### Requirement: Bearer auth
Mobile clients MUST obtain an access token via password or Google id token and send `Authorization: Bearer`.

#### Scenario: Password login
- **WHEN** `POST /api/v1/auth/login` succeeds
- **THEN** the response includes `accessToken` and `user`

#### Scenario: Missing token
- **WHEN** a protected route is called without a Bearer token
- **THEN** the response is 401

### Requirement: Card and review resources
#### Scenario: Create and review
- **WHEN** an authenticated user creates a card and later posts a rating
- **THEN** the card is stored on their deck and SM-2 state updates
