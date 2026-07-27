# Role access, member trash, and feedback deduplication

## Goals

- Centralize role permissions so page, navigation, API, and admin documentation share one policy source.
- Add an admin access-control route with separate top-level tabs for roles and members.
- Provide database-backed CRUD for custom staff roles and assign them to members.
- Add a recoverable trash for staff and parent accounts, including restore and guarded permanent deletion.
- Replace tab-local error-report deduplication with durable server-side aggregation.

## Security invariants

- Every protected page and mutation checks authorization on the server.
- A user cannot trash, permanently delete, ban, or demote the current account.
- The final active super admin cannot be removed, trashed, banned, or permanently deleted.
- Trashing an account revokes every active session and prevents new sessions.
- Permanent deletion is available only from trash and relies on database cascades/set-null rules.
- Built-in roles and the internal `custom_staff` marker cannot be edited or deleted.
- A custom role cannot receive family-only permissions.
- Management permissions automatically include the view permission required to reach their workspace.
- Member records are loaded only for identities with `members.manage`.
- A role cannot be deleted while any active or trashed account still references it.

## Feedback aggregation

- Automatic reports receive a stable server-generated fingerprint that ignores volatile request IDs.
- A unique database index makes aggregation concurrency-safe across tabs, devices, retries, and server instances.
- Repeated reports update occurrence count, last-seen time, and latest diagnostic context instead of creating another card.
- Resolved/dismissed reports reopen only when the same fault returns after a cooldown.

## Role and member workspace

- `/admin/access-control?tab=roles` is the canonical role workspace.
- `/admin/access-control?tab=members` is shown only to identities with `members.manage`.
- `/admin/members` redirects to the member tab for backward compatibility.
- Role create/update/delete operations write audit-log entries.
- Assigning a custom role stores the stable custom role key while preserving a coarse staff role for authentication middleware.
- URL query state is the single source of truth for the top-level tab so browser navigation cannot race local UI state.

## Acceptance checks

- Create, edit, assign, unassign, and delete a custom role through the browser.
- Prevent deleting a role while it is assigned.
- Keep system roles read-only.
- Apply custom permissions to server pages, API handlers, navigation, and action visibility.
- Pass lint, type-check, formatting, unit tests, production build, migration generation, and the access-control E2E suite.
