# Fix world age-group visibility invariant

Status: done
Blockers: none

## Scope completed

1. Added required age-group controls to world create/edit UI and typed API payloads.
2. Persisted world age groups transactionally in admin operations.
3. Rejected mission publication and scheduling when the world is hidden or does not cover the mission audience.
4. Prevented narrowing or hiding a published world while existing published missions still depend on it.
5. Added a migration to infer missing world age groups from mission age groups.
6. Repaired the affected production data and verified the mission through the live catalog API.
7. Added unit, PostgreSQL integration and Playwright regression coverage.

## Verification

- Formatting of changed files, ESLint, TypeScript and production build.
- Full unit suite with one worker.
- PostgreSQL integration tests for persistence, partial updates, publication validation, audience-removal protection and world-visibility protection.
- Browser test covering failed publication, corrected world audience, successful publication, visibility in the public catalog and protection against later audience or world visibility removal.
