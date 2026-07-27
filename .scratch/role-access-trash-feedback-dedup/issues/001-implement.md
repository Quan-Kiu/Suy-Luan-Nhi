# Implement access control, account trash, and feedback aggregation

Status: completed
Blockers: none

## Acceptance

- `/admin/access-control` documents role capabilities and routes and allows role assignment.
- `/admin/members` remains compatible by redirecting to the member tab.
- Staff and parent accounts can be moved to trash, restored, and permanently deleted with policy guards.
- Trashed accounts cannot sign in or use old sessions.
- Automatic feedback duplicates aggregate into one item with occurrence metadata.
- Unit, integration, build, and targeted browser verification pass.

## Verification

- `DATABASE_URL=<isolated PostgreSQL> npm run check`: format, lint, TypeScript, typography audit, data-consistency audit, 312 tests, and production build passed.
- Full migration chain and seed passed on PostgreSQL 17.
- Upgrade simulation applied migrations 0000-0023, inserted three duplicate automatic reports plus one manual report, then applied 0024: duplicates became one row with occurrence count 3; the manual report remained separate.
- `E2E_DATABASE_URL=<isolated PostgreSQL> npx playwright test e2e/access-control-feedback-dedupe.desktop.spec.ts --project=desktop-chromium`: 2 browser tests passed for account trash/session revocation/restore and automatic feedback aggregation.
