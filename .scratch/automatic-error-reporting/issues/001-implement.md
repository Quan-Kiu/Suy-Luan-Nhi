# Implement privacy-safe automatic error reporting

Status: completed
Blockers: none

## Delivered

- Added an opt-in parent setting, disabled by default.
- Captured browser, React error-boundary, unhandled promise, and unexpected API failures.
- Added privacy-safe navigation, interaction, form-submit, and API breadcrumbs.
- Redacted query strings, emails, tokens, IDs, long numbers, input values, and private content.
- Rechecked consent and rate limits on the server before storing a report.
- Reused the admin feedback workflow with technical detail and breadcrumb views.
- Added schema, client, API, and admin UI tests.

## Verification

- ESLint: passed.
- TypeScript: passed.
- Targeted tests: 14 passed.
- Full unit suite: 275 passed, 14 skipped integration tests.
- Production build: passed.
- Repository-wide format check remains blocked by three unrelated pre-existing files.
- Drizzle schema generation remains blocked by the pre-existing 0019/0020 snapshot parent collision; migration 0021 was authored explicitly.
