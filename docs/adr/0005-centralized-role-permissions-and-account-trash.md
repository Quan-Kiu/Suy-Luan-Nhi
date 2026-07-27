# ADR-0005: Centralized role permissions and recoverable account trash

## Status

Accepted

## Context

Admin navigation, pages, and route handlers previously repeated role arrays independently. That made it possible for the visible menu, documented role behavior, and server authorization to drift apart. Parent and staff accounts also had ban controls but no recoverable deletion lifecycle comparable to child profiles.

## Decision

Define one permission registry in `src/auth/permissions.ts`. Each permission owns a user-facing capability description and the page/API route patterns it protects. Roles receive permissions through a fixed role-to-permission map. Admin navigation, server-rendered pages, and API mutations evaluate this registry through `requirePermission` or `requireApiPermission`; UI visibility is never treated as authorization.

Expose `/admin/access-control` as the role and member workspace. It documents the effective capability and route matrix, supports role assignment, and separates staff, parent, and trash views. Keep `/admin/members` as a compatibility redirect.

Implement account trash as soft deletion on the user record. Moving an account to trash revokes all sessions, blocks future authentication, preserves the previous ban state, and writes an audit event. Restore reinstates the previous ban state. Permanent deletion is allowed only from trash and follows existing database cascade and set-null relationships.

Protect the current account and the final active super admin from demotion, ban, trash, or permanent deletion.

## Consequences

Adding a protected admin capability now requires a permission definition and mapping rather than another role condition. Route documentation remains near the executable policy and can be rendered directly in the admin workspace. Authorization remains server-side even when navigation or controls are hidden.

Account removal becomes reversible by default. Permanent deletion remains explicit and may cascade through family data, so the UI must present a destructive confirmation. Deployments must apply migration `0024_access_control_member_trash.sql` before application code that reads the new user columns.
