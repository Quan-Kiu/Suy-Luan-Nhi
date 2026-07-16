# Suy Luận Nhí production completion specification

## Problem Statement

The current application demonstrates the visual MVP but stores profiles and progress in localStorage, has no real identity or role enforcement, supports one hard-coded mission, and leaves most parent and admin screens non-functional. It cannot safely preserve family data, coordinate content review, or operate across devices and deployments.

## Solution

Convert the product into a production-oriented, database-backed Next.js application. Parents authenticate and manage multiple Child Profiles; children play published missions through persistent Mission Sessions; parents use complete activity, suggestion, resource, and settings screens; content teams create and review missions through an authenticated CMS; and operators can deploy, migrate, seed, monitor, export, and audit the system.

## User Stories

1. As a parent, I can register, verify, sign in, reset my password, and sign out.
2. As a parent, I can create, edit, switch, soft-delete, restore, export, and reset each Child Profile.
3. As a parent, I can set and change a hashed Parent PIN and am temporarily locked after repeated incorrect attempts.
4. As a child, I only see published worlds and missions suitable for my age group and unlock state.
5. As a child, I can resume an in-progress Mission Session on another device.
6. As a child, I can complete single-choice, pattern, drag/drop, fill-answer, and sorting questions.
7. As a child, I receive progressive hints, positive retry feedback, optional sound, and no competitive ranking.
8. As a child, my attempts, response times, hint use, completion, skills, stars, and badges are recorded atomically.
9. As a parent, I can see a ten-second dashboard, filter activity history, browse conversation suggestions, and read practical resources.
10. As a parent, I can manage sound, effects, notifications, privacy choices, data export, and deletion requests.
11. As a content admin, I can create, edit, duplicate, preview, archive, and submit missions with multiple ordered questions and media.
12. As a reviewer, I can inspect the exact Child Renderer, review history, Safety Checklist, comments, approve, or reject.
13. As an authorized publisher, I can publish only approved, complete missions; published content appears in the child app.
14. As a super admin, I can manage users, roles, worlds, age groups, skills, resources, system settings, reports, and audit logs.
15. As an operator, I can run migrations, seed deterministic content, check health, deploy a Docker image, and rely on CI verification.

## Implementation Decisions

- PostgreSQL is the system of record; browser storage is removed from production behavior.
- Better Auth provides email/password identity, database sessions, reset/verification hooks, rate limiting, and role fields.
- Product roles are parent, content admin, reviewer, and super admin; server-side authorization is mandatory on every protected mutation and read.
- Drizzle schemas are split by domain but migrated together. Multi-table gameplay and review operations use transactions and idempotency guards.
- The gameplay module exposes start/resume, request hint, submit answer, complete, and exit interfaces.
- Question payloads use a discriminated union covering five SPEC question types. Evaluation remains server-authoritative.
- The CMS writes draft versions and review history; only an approved version can become published.
- Media uses a filesystem adapter locally and an S3-compatible adapter in production.
- The application seeds four Mission Worlds, twelve creative Missions, badges, suggestions, resources, and demo role accounts.
- Parent and admin areas receive dedicated layouts and all screens listed in SPEC sections 7, 9, and 10.
- Analytics events exclude prohibited child data and are first-party database records only.

## Testing Decisions

- Test at the highest stable seams: auth-protected HTTP routes, gameplay command module, publication workflow, parent data module, and browser E2E journeys.
- Use a dedicated PostgreSQL test database; tests assert public results rather than internal query calls.
- Cover concurrent/duplicate answer submission, invalid session ownership, lockout, rejected publication, data export, and soft deletion.
- CI runs format, lint, typecheck, unit/integration tests, production build, migration verification, and Playwright smoke journeys.

## Out of Scope

Native mobile binaries, teacher/classroom mode, marketplace, public leaderboards, open child chat, external advertising, paid child-mode purchases, automatic AI-authored content, and real-time push notification delivery.

## Further Notes

Email delivery and S3 credentials are environment-driven. Development uses Mailpit and local uploads. The supplied screenshots remain the visual baseline, while missing screens follow the same watercolor child style and the existing desktop CMS language.
