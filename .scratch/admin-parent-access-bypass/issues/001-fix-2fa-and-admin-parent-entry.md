# Fix 2FA action layout and admin parent entry

- [x] Align shared button icon and label; keep the 2FA action on one line.
- [x] Route the Super Admin shortcut through a protected bridge.
- [x] Bind the admin Parent Gate token to the current authenticated session.
- [x] Keep direct parent-area entry protected by PIN setup or verification.
- [x] Add regression tests and run quality checks.

## Verification

- Targeted Vitest: 12 tests passed.
- Full Vitest with one worker: 224 passed, 7 integration tests skipped by default.
- Focused Playwright: 4 passed.
- ESLint, TypeScript, typography audit, data-consistency audit, and production build passed.
- Repository-wide Prettier remains blocked by three unrelated pre-existing formatting files.
