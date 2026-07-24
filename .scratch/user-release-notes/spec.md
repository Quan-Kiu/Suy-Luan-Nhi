# User-facing release notes

## Goal

Give parents a concise, trustworthy view of meaningful product changes without exposing technical implementation details or admin audit records.

## Requirements

- Add a protected `/parent/whats-new` page with releases ordered newest first.
- Keep release content in a typed, version-controlled catalog with future-date filtering.
- Separate features, improvements, fixes, and security updates visually.
- Surface an unobtrusive “new update” indicator and announcement until the latest version is viewed or dismissed.
- Store viewed state locally; do not add personal tracking or a database migration.
- Keep the existing admin audit log as the detailed operational history.
- Add a root `CHANGELOG.md` for technical release maintenance.
- Cover catalog ordering/filtering and viewed-state behavior with targeted tests.
