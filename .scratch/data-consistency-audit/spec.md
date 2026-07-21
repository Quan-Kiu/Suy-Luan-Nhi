# Data consistency and cache invalidation audit

## Scope

Audit all application mutation routes, persistent App Router layouts, TanStack Query caches, Next server caches, and historical reads that can show stale or retroactively changed data.

## Confirmed defects fixed

1. **Child creation returned to a stale `/profiles` page**
   - Cause: the list is rendered by a Server Component while the mutation only invalidated TanStack Query.
   - Fix: revalidate `/profiles` and `/onboarding` after create/update/delete.

2. **Selecting another child kept the previous child in the persistent child layout**
   - Cause: the selection cookie changed, but `(child)/layout.tsx` remained mounted and `ActiveChildProvider` kept the original server prop.
   - Fix: make active child state explicit, update it from the successful selection mutation, and remount from server data when identity/profile fields change.

3. **Editing the active child's name or age could leave the child header/map context stale**
   - Cause: profile cards refreshed but the persistent provider was not updated.
   - Fix: update active-child context from create/edit mutation results and invalidate all child-prefixed queries.

4. **Taxonomy changes could remain stale in the child catalog and parent dashboard**
   - Affected data: worlds, skills, age groups, badges.
   - Fix: central taxonomy invalidation expires published-catalog and taxonomy tags, then revalidates dependent admin, child, and parent routes. Parent dashboard cache now depends on the taxonomy tag.

5. **Archiving a published mission could leave it visible to a child for the cache TTL**
   - Cause: archive changed database status without expiring the published catalog.
   - Fix: archive now invalidates published catalog plus admin mission views.

6. **Mission review and publishing statuses could remain stale in admin lists**
   - Affected actions: create, edit, duplicate, submit, approve, reject, restore, schedule, publish, archive, scheduled cron publish.
   - Fix: central admin mission-view invalidation plus TanStack Query invalidation in mutation clients.

7. **Global system-setting changes could leave prefetched layouts/routes stale**
   - Fix: successful settings mutations revalidate the root layout; content-variable changes also expire published catalog data.

8. **Historical parent activity could change after an administrator edited a mission**
   - Cause: activity history joined mutable `missions.title` and `missions.coverUrl` instead of the immutable mission version played by the child.
   - Fix: recent activity and full history resolve title/cover from `missionVersions.snapshot`, with current mission data only as a corruption fallback.

## Mutation route inventory

- Total mutation Route Handlers: **42**
- With explicit server invalidation after this audit: **29**
- Without server invalidation: **13**

The remaining 13 routes either return the new state directly to the current client, change request/session/cookie state, or mutate data that is not read through a server cache. They include feedback submission/status, media CRUD, account-member operations, parent export/delete requests, parent unlock/settings, child selection, and answer/hint operations.

## Regression coverage

`e2e/data-consistency.desktop.spec.ts` covers:

- create/select a new child and open the correct map without reload;
- edit the active child and retain the updated identity across client navigation;
- update world taxonomy and observe the new value from an already-warmed mission-map cache;
- archive a published mission and remove it from an already-warmed mission-map cache immediately.

## Verification

- ESLint: passed
- TypeScript: passed
- Vitest: 136 passed, 1 database integration test skipped by default
- Targeted Playwright data-consistency tests: passed
- Existing CMS taxonomy E2E selected by the audit grep: passed

## Remaining follow-up risk

- Run the complete desktop/mobile Playwright matrix before release; targeted audit tests do not replace every product flow.
- Add a database integration test specifically asserting immutable historical mission presentation if the integration suite is made mandatory in CI.
- Keep the mutation inventory check as a CI/static audit so new cached reads cannot be added without corresponding invalidation ownership.

## Additional audit findings

9. **A Parent Gate browser test depended on execution order**
   - Cause: one test configured a PIN, while another test always waited for a math challenge.
   - Fix: the regression now uses the shared gate helper, which handles either the configured PIN or a generated math challenge.

10. **PostgreSQL TLS mode has a future compatibility warning**

- The current local Neon connection uses `sslmode=require`. The installed `pg` version currently treats it like `verify-full`, but the next major version will adopt weaker libpq `require` semantics.
- Deployment and local connection strings should explicitly use `sslmode=verify-full` before upgrading to `pg` 9 / `pg-connection-string` 3.

## Prevention added

- `scripts/audit-data-consistency.ts` inventories all API mutation handlers.
- `npm run audit:data-consistency` fails when a mutation has neither explicit invalidation nor a reviewed local-only reason.
- The audit is included in `npm run check`.
