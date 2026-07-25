# Add a session exit to authentication gates

Status: completed
Labels: ready-for-review

## Root cause

- Gate pages assumed that password, PIN, MFA, and account-email recovery were always available.
- The public landing header only linked into the current account workspace and had no authenticated logout action.
- A user who could not recover the current account therefore had no UI path to end the session and sign in with another account.

## Resolution

- Reuse the existing hard-navigation sign-out flow through a configurable switch-account button.
- Add the action to the Parent Gate, PIN setup/recovery, MFA setup/challenge, and authenticated landing navigation.
- Keep the action outside gate form busy states so a blocked form cannot disable the escape path.
- Add unit and browser regressions for authenticated landing and locked Parent Gate behavior.
