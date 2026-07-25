# Gate session exit

## Goal

- An authenticated user must never be trapped behind a PIN, MFA, or account setup gate.
- Every authenticated gate exposes a clear way to sign out and use another account.
- The public landing header exposes logout whenever an authenticated session is active.
- Logout uses a fresh document navigation so cached authenticated UI cannot survive the session change.
