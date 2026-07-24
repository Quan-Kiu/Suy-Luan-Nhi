# 001 — Add parent-facing “Có gì mới”

Status: completed
Blockers: none

## Acceptance

- [x] Parents can open a dedicated release-notes page from desktop and mobile navigation.
- [x] Only published releases are shown and newest releases appear first.
- [x] The latest unseen release is announced without blocking the parent workflow.
- [x] Opening or dismissing the announcement clears the new-update indicator on that device.
- [x] Release notes contain user value, not commits, payloads, or audit snapshots.
- [x] Admin audit history remains separate and unchanged.
- [x] Unit tests, TypeScript, ESLint, repository audits, E2E checks, and production build pass.

## Verification

- `npm run lint`
- `npm run typecheck`
- `npm run audit:typography`
- `npm run audit:data-consistency`
- `npm test` — 263 passed, 14 skipped integration tests
- `npx playwright test e2e/parent-release-notes.desktop.spec.ts e2e/parent-release-notes.mobile.spec.ts` — 2 passed
- `npm run build`
