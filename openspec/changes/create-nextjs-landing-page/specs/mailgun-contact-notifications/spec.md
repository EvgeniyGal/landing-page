## ADDED Requirements

### Requirement: Contact submissions are accepted through a server-side endpoint
The system SHALL expose a server-side submission endpoint that accepts validated contact payloads from the landing page CTA/contact interface.

#### Scenario: Visitor submits valid contact inquiry
- **WHEN** the visitor submits required contact fields through the landing page form
- **THEN** the system validates the payload and processes the submission without exposing Mailgun credentials to the client

### Requirement: Valid submissions trigger Mailgun email delivery
The system MUST send an email notification via Mailgun SDK/API for each valid contact submission, using configured sender/domain settings from environment variables.

#### Scenario: API request succeeds with Mailgun
- **WHEN** the endpoint receives a valid payload and Mailgun returns success
- **THEN** the system returns a success response to the client and confirms notification delivery intent

### Requirement: Submission failures return actionable errors
The system SHALL return explicit failure responses when validation fails, required Mailgun configuration is missing, or Mailgun delivery fails.

#### Scenario: Mailgun configuration is missing
- **WHEN** a submission is received and one or more required Mailgun environment variables are absent
- **THEN** the system rejects the request with an error response indicating server configuration is incomplete

#### Scenario: Mailgun API call fails
- **WHEN** Mailgun returns an error during send attempt
- **THEN** the system returns a non-success response and logs enough context for debugging without leaking sensitive credentials
