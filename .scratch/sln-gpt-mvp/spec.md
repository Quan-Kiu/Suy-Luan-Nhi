# Suy Luận Nhí MVP specification

## Problem Statement

The supplied design system, ten reference screenshots, and detailed product SPEC are not yet represented by a working application. Families need a safe child flow, parents need a protected progress view, and content teams need a mission editor with a trustworthy preview and safety workflow.

## Solution

Deliver a responsive Next.js application that reproduces the watercolor storybook experience across landing, profile onboarding, returning profile, mission map, mission detail, gameplay, retry/hint feedback, completion, parent dashboard, and admin mission editing. Domain data is validated by Zod, forms use React Hook Form, and server-state interactions use TanStack Query through replaceable adapters.

## User Stories

1. As a parent, I can understand the product's safety promise before creating a child profile.
2. As a parent, I can create a nickname-only Child Profile with an age group.
3. As a returning family, I can select the saved Child Profile and enter the Mission Map.
4. As a child, I can see available and upcoming Mission Worlds without competitive rankings.
5. As a child, I can understand a Mission's story, duration, Thinking Habit, and reward before starting.
6. As a child, I can answer a pattern question using large visual controls.
7. As a child, I receive immediate positive feedback when correct.
8. As a child, I receive a gentle hint and can retry when an answer is not yet correct.
9. As a child, I can complete the Mission and receive a badge celebrating Thinking Habits.
10. As a parent, I must pass a Parent Gate before viewing progress.
11. As a parent, I can understand weekly progress and receive a concrete conversation suggestion within ten seconds.
12. As a content admin, I can edit mission metadata and question content with validation.
13. As a content admin, I can preview the exact Child Renderer used by gameplay.
14. As a reviewer, I can see Safety Checklist state and know whether publishing is allowed.
15. As a keyboard or screen-reader user, I can navigate labeled controls with visible focus and meaningful image alternatives.

## Implementation Decisions

- Use Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Zod, React Hook Form, TanStack Query, Lucide, and local assets only.
- Organize the repository around domain schemas, data adapters, shared rendering modules, and route-level screens.
- Use browser storage for Child Profile and progress in the MVP while preserving adapter seams.
- Use one shared Child Renderer for gameplay and admin preview.
- Keep child screens mobile-first at 360–430 CSS pixels and let the landing page and admin editor expand responsively.
- Support the first complete Thám tử Quy luật Mission while rendering all four Mission Worlds from data.

## Testing Decisions

- Test Zod schemas and answer evaluation as pure domain seams.
- Test profile creation, retry/hint behavior, parent unlock, and admin validation through user-visible behavior.
- Add a Playwright smoke path from landing to mission completion.
- Run lint, TypeScript, unit tests, and production build before review.

## Out of Scope

Production authentication, cloud synchronization, payments, public rankings, voice-over, content scheduling, multi-language support, and a production database.

## Further Notes

The source SPEC remains authoritative for future expansion. The ten screenshots are the visual acceptance references for this implementation.
