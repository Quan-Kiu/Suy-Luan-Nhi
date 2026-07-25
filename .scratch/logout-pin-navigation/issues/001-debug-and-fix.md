# Debug and fix logout auth UI and PIN redirect loop

Status: completed
Labels: ready-for-review

## Root cause

- Better Auth emits its session refresh signal after the sign-out request resolves, while the App Router navigated to a cached Home immediately. The landing CTA could therefore reuse the previous staff session snapshot.
- PIN setup changed database and cookie-backed authorization state, then used an RSC client navigation into routes guarded by that new state. A stale or failed RSC request could retry/fallback and create a redirect/reload loop on mobile.
- The auth-aware Home CTA did not hold a deterministic server/client hydration state, which could produce a skeleton/link hydration mismatch around fast session changes.

## Resolution

- Use a fresh document replacement after sign-out and after successful PIN setup.
- Keep the Home auth CTA in loading state until hydration completes.
- Scope the `react-server` condition to E2E database preparation instead of the Next test server.
- Add mobile regressions for stale session handling and PIN navigation.

## Verification

- Targeted mobile E2E: 2 passed.
- Unit tests: 205 passed, 6 skipped integration tests.
- ESLint targets, TypeScript, diff check: passed.
- Production build: passed.
