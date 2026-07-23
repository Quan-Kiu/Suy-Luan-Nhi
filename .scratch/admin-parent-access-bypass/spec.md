# Admin parent-area access

## Problem

- The 2FA confirmation action wraps its icon and label awkwardly.
- A Super Admin entering the parent area from admin navigation is asked to create or enter a parent PIN even though the staff session has already passed role and MFA checks.

## Expected behavior

- Shared primary buttons align icons and labels horizontally; the short 2FA action remains on one line.
- The Super Admin shortcut uses a protected admin bridge that grants a short-lived, signed Parent Gate token bound to the current staff session.
- The bridge works even when the admin account has no parent PIN.
- Direct `/parent` entry still requires the normal Parent Gate or PIN setup.
- Accounts without the Super Admin role cannot use the bridge.

## Verification

- Targeted component, access-policy, route, and navigation tests.
- TypeScript, ESLint, formatting, unit tests, production build, and focused Playwright coverage.
