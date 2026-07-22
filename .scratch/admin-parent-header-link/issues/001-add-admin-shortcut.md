# 001 — Add admin shortcut to parent navigation

**Blockers:** none

## Work

- Derive admin access from the authenticated role in the parent layout.
- Pass the capability through the parent shell to the persistent header.
- Add accessible desktop and mobile links to `/admin`.
- Register the user-facing label and add focused acceptance coverage.

## Status

- [x] Implemented
- [x] Verified

## Verification

- `npx eslint` passed for the changed parent navigation files and tests.
- `npm run typecheck` passed.
- `npx vitest run src/features/parent/__tests__/parent-header.test.tsx` passed: 2 tests.
- `npx playwright test e2e/admin-parent-shortcut.desktop.spec.ts --project=desktop-chromium --workers=1` passed: 4 tests.
