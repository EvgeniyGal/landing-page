## Context

The change introduces a production-ready Next.js landing page based on provided static references in `requarenments/` (`code.html`, screenshot, `DESIGN.md`, and `page content.md`). The primary constraints are visual fidelity to the dark "Kinetic Architect" design language, clean React componentization for long-term maintainability, and a secure server-side email workflow using Mailgun.

The current state is an unimplemented concept. There is no existing OpenSpec capability baseline in this workspace, so this design establishes initial architecture for page composition, content modeling, and contact delivery.

## Goals / Non-Goals

**Goals:**
- Deliver a Next.js page that reproduces the provided section structure, content hierarchy, and visual tone.
- Convert monolithic HTML into reusable React components organized by page section and shared UI primitives.
- Implement a contact submission flow that sends email notifications using Mailgun SDK/API from server-side code only.
- Keep implementation deployable with environment-based configuration and explicit error handling paths.

**Non-Goals:**
- Building a full CMS/editor interface for live content editing.
- Adding user accounts, dashboards, or analytics pipelines beyond basic contact submission.
- Implementing CRM synchronization, queueing, or multi-provider failover for email in this change.

## Decisions

### 1) App Router-based single-page composition
- **Decision**: Use Next.js App Router with a single landing page route as the entry point.
- **Why**: Matches current scope and keeps UX cohesive while preserving flexibility for future subpages.
- **Alternatives considered**:
  - Pages Router: viable but unnecessary for a greenfield Next.js layout.
  - Static HTML export only: lower flexibility and poor maintainability for repeated content updates.

### 2) Section-driven component architecture
- **Decision**: Split the page into section components (`Hero`, `Proof`, `Services`, `Projects`, `Edge`, `Stack`, `CTA`, `Footer`) and extract shared patterns (section headers, metric rows, pill tags, project cards).
- **Why**: Mirrors the source HTML semantics and allows targeted edits without touching unrelated blocks.
- **Alternatives considered**:
  - Single monolithic component: faster initially but harder to maintain.
  - Fully dynamic schema-renderer: excessive abstraction for first implementation.

### 3) Structured content module
- **Decision**: Move textual/stat data from raw markup into typed data constants sourced from `page content.md`.
- **Why**: Enables consistent rendering, easier copy updates, and testability.
- **Alternatives considered**:
  - Hard-coded strings inside JSX: quicker but makes maintenance and localization harder.

### 4) Styling approach with Tailwind + design tokens
- **Decision**: Recreate required design language using Tailwind classes and project-level token extensions aligned to `requarenments/DESIGN.md`.
- **Why**: Fast implementation with strong consistency and explicit adherence to no-line / tonal hierarchy constraints.
- **Alternatives considered**:
  - CSS Modules only: possible but slower for dense utility-style layout.
  - Inline style replication from static HTML: less reusable and harder to standardize.

### 5) Mailgun integration via server-side API route
- **Decision**: Handle CTA/contact form submissions through a Next.js API route (or route handler) that validates payload and sends email with Mailgun SDK/API.
- **Why**: Keeps API keys secret, supports validation/rate-limiting hooks, and isolates external dependency failures from UI rendering.
- **Alternatives considered**:
  - Client-side Mailgun calls: rejected due to credential exposure.
  - SMTP transport via nodemailer: viable, but direct Mailgun SDK/API is requested and simpler for this scope.

## Risks / Trade-offs

- **[Risk] Pixel-perfect drift from reference screenshot** -> **Mitigation**: keep section-level snapshot checks and iterate against `screen.png` during implementation.
- **[Risk] Overly rigid content model from first pass** -> **Mitigation**: start with typed constants plus lightweight interfaces, avoid premature CMS complexity.
- **[Risk] Mailgun delivery issues due to domain/sender misconfiguration** -> **Mitigation**: validate required env vars at startup/runtime and return actionable API errors.
- **[Risk] Spam/abuse on public contact endpoint** -> **Mitigation**: include input validation and design endpoint for easy addition of CAPTCHA/rate limits.
- **[Trade-off] Rich motion effects omitted initially** -> **Mitigation**: prioritize structure, readability, and reliability; defer advanced animation polish.

## Migration Plan

1. Scaffold/verify Next.js app structure and add component/data modules for landing sections.
2. Implement page composition and tokenized styling to match the provided design assets.
3. Add contact form UI and server endpoint contract.
4. Integrate Mailgun SDK/API with environment variables and robust error handling.
5. Verify local flow (render + submit), then deploy with production Mailgun env values.

**Rollback strategy**:
- If Mailgun integration blocks release, temporarily disable submission handling while keeping page rendering intact.
- Revert to previous deployment/version for full rollback if route-level errors affect runtime.

## Open Questions

- Which destination email(s) should receive inquiries in each environment (dev/staging/prod)?
- Should contact submissions include persistence (DB/log) in addition to email delivery?
- Is anti-spam (captcha/rate limit) required in the initial release or acceptable as follow-up?
