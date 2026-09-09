## Purpose

Invited users can sign in with Google using the same account as email/password.

## ADDED Requirements

### Requirement: Same email is the same user
Google sign-in MUST look up the existing user by lowercase email. The system MUST NOT create a user from Google.

#### Scenario: Active password user uses Google
- **WHEN** an active invited user signs in with Google using the same email
- **THEN** the session user id is that existing user

#### Scenario: Unknown email
- **WHEN** Google returns an email with no user row
- **THEN** sign-in is rejected

### Requirement: Invited Google activates
#### Scenario: Invited email
- **WHEN** an invited user signs in with Google
- **THEN** status becomes active and they receive a session

### Requirement: Disabled rejected
#### Scenario: Disabled
- **WHEN** a disabled user’s email is used with Google
- **THEN** sign-in is rejected
