# Logout auth UI and PIN navigation loop

## Goal

- After logout, Home must render only unauthenticated actions.
- After successful parent PIN setup on mobile, navigation must settle on the intended destination without reload/redirect loops.
- Preserve server/client authorization boundaries and avoid timer- or viewport-specific workarounds.
