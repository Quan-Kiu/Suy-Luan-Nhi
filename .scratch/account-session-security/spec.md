# Account session security

## Goal

Give a signed-in parent a clear, privacy-conscious view of their account and active login sessions, with safe controls to revoke unknown devices.

## Scope

- Show account email, verification state, two-factor state, and configured sign-in methods.
- Show active sessions with a friendly browser, operating-system, device, IP, activity, and expiry summary.
- Mark the current session and prevent it from being revoked accidentally from the session list.
- Allow revoking one other session or all other sessions after an explicit confirmation.
- Keep every revoke operation ownership-scoped and audit logged.

## Acceptance

- A user can never read or revoke another user's session.
- The current session remains active when other sessions are revoked.
- Session responses never expose raw session tokens or OAuth credentials.
- Parent settings render the security center on desktop and mobile.
- Unit, integration, build, and browser verification pass.
