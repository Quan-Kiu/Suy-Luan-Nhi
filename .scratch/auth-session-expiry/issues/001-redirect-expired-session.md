# Redirect expired client sessions to sign-in

Status: completed
Labels: ready-for-review

## Root cause

- Protected server pages redirect when no valid session exists, but the shared Axios client treated HTTP 401 like an ordinary mutation error.
- A page already rendered from server data could therefore stay visible after its session was revoked or expired, then show “Cần đăng nhập” inside the feature UI.

## Resolution

- Handle HTTP 401 centrally in the shared Axios response interceptor.
- Use a hard document replacement to `/auth/sign-in` and preserve the current internal URL in `callbackUrl`.
- Skip redirects from authentication pages and collapse concurrent 401 responses into one navigation.
- Keep non-401 API errors on their existing inline error path.

## Verification

- Unit tests: 240 passed, 12 integration-gated tests skipped.
- Targeted browser regression: 1 passed on desktop Chromium.
- ESLint, TypeScript, typography audit, data-consistency audit, production build, changed-file formatting, and diff check passed.
- Repository-wide formatting remains blocked by three unrelated pre-existing files.
