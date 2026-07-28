# Production hardening P0

## Goal

Reduce the highest immediate production risks found during the code and UI audit without introducing a broad redesign.

## Scope

- Align child profile name constraints between application validation and PostgreSQL.
- Prevent stale admin resource edits and archive operations from overwriting newer changes.
- Make the admin visual audit fail on console errors and undersized text.
- Make E2E database preparation wait for PostgreSQL readiness.
- Remove verified LCP image warnings on audited admin routes.

## Acceptance

- Stale resource writes return a typed 409 conflict and preserve the newer database row.
- Resource editor explains the conflict and lets the operator reload the current version.
- PostgreSQL rejects one-character child profile names.
- Admin audit asserts all collected quality signals.
- Targeted tests, integration tests, build, and affected E2E flows pass.
