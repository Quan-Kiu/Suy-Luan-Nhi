# Role access, member trash, and feedback deduplication

## Goals

- Centralize role permissions so page, navigation, API, and admin documentation share one policy source.
- Add an admin access-control route that shows each system role, functions, and routes, while keeping member role assignment nearby.
- Add a recoverable trash for staff and parent accounts, including restore and guarded permanent deletion.
- Replace tab-local error-report deduplication with durable server-side aggregation.

## Security invariants

- Every protected page and mutation checks authorization on the server.
- A user cannot trash, permanently delete, ban, or demote the current account.
- The final active super admin cannot be removed, trashed, banned, or permanently deleted.
- Trashing an account revokes every active session and prevents new sessions.
- Permanent deletion is available only from trash and relies on database cascades/set-null rules.

## Feedback aggregation

- Automatic reports receive a stable server-generated fingerprint that ignores volatile request IDs.
- A unique database index makes aggregation concurrency-safe across tabs, devices, retries, and server instances.
- Repeated reports update occurrence count, last-seen time, and latest diagnostic context instead of creating another card.
- Resolved/dismissed reports reopen only when the same fault returns after a cooldown.
