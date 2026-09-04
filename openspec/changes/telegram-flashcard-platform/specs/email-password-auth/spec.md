## Purpose

Invite-only email and password accounts with Admin and User roles, session-based admin access, invitation activation, and password reset by email.

## ADDED Requirements

### Requirement: Credentials login for active accounts
The system SHALL authenticate users with email and password. Only accounts with status `active` MAY receive a session. After a successful admin login, the system MUST redirect the user to the admin dashboard.

#### Scenario: Admin signs in
- **WHEN** an active admin submits a valid email and password
- **THEN** the system creates a session and redirects to the admin dashboard

#### Scenario: Invited account cannot sign in
- **WHEN** a user with status `invited` submits credentials
- **THEN** the system rejects the login

#### Scenario: Disabled account cannot sign in
- **WHEN** a user with status `disabled` submits valid credentials
- **THEN** the system rejects the login

### Requirement: Admin-only dashboard access
The system SHALL allow only users with role `admin` to access admin dashboard routes. Authenticated users with role `user` MUST be denied admin access and shown that no user dashboard is available yet.

#### Scenario: User is blocked from admin routes
- **WHEN** an authenticated user with role `user` requests an admin dashboard page
- **THEN** the system denies access and does not render admin management UI

#### Scenario: Unauthenticated visitor is sent to login
- **WHEN** an unauthenticated visitor requests an admin dashboard page
- **THEN** the system redirects to the login page

### Requirement: Invite-only account creation
The system SHALL NOT expose public registration. An admin MUST create a user by email. The system MUST email an invitation link. Opening the link and setting a password MUST activate the account.

#### Scenario: Admin invites a user
- **WHEN** an admin submits a valid email to invite
- **THEN** the system creates an invited user and sends an invitation email containing a one-time activation link

#### Scenario: Invitee sets a password
- **WHEN** the invitee opens a valid unused invitation link and submits a new password
- **THEN** the system stores the password hash, sets status to `active`, and consumes the invitation token

#### Scenario: Expired or used invitation is rejected
- **WHEN** the invitee opens an expired or already-used invitation link
- **THEN** the system refuses password setup and does not activate the account

### Requirement: Password reset via email
The system SHALL allow an active user to request a password reset by email. A valid reset link MUST allow setting a new password and MUST consume the token.

#### Scenario: User requests reset
- **WHEN** a visitor submits an email that belongs to an active account
- **THEN** the system sends a password reset email with a one-time link

#### Scenario: Unknown email does not reveal accounts
- **WHEN** a visitor submits an email that is not registered
- **THEN** the system returns a generic success response and does not send mail

#### Scenario: Reset token is consumed
- **WHEN** the user submits a new password with a valid reset token
- **THEN** the system updates the password hash and invalidates the token
