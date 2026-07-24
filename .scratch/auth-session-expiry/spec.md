# Expired API session navigation

## Goal

- When a custom application API returns HTTP 401, move the browser to the sign-in page instead of rendering an inline mutation error.
- Preserve the current internal page as `callbackUrl` so the user can resume after signing in.
- Use a hard document replacement, avoid redirect loops on auth pages, and collapse concurrent 401 responses into one navigation.
