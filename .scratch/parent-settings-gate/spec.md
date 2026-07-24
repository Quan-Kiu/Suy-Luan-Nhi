# Parent settings gate regression

## Problem

The parent settings endpoint requires an active Parent Gate for every settings update. Routine preferences such as sound, notifications, and automatic error-reporting consent are therefore rejected with `FORBIDDEN` when the short-lived gate expires while the settings screen remains open.

## Expected behavior

- An authenticated Parent or Super Admin can save routine family preferences without an active Parent Gate.
- Changing the parent PIN remains protected by an active Parent Gate.
- The API returns a stable `PARENT_GATE_REQUIRED` code when a protected operation is attempted without the gate.
- Saving a routine preference succeeds even when the gate cookie expires after the settings page was opened.

## Verification

- Route tests cover routine updates, protected PIN changes, and authorization failures.
- Focused Playwright coverage removes the gate cookie while the settings page remains open and verifies a routine save succeeds.
- TypeScript, ESLint, formatting, targeted unit tests, and the focused E2E test pass.
