# Code review — 2026-07-16

## Scope

- Baseline: `3347e52` (Create Next App initial commit)
- Review target: staged implementation changes
- Spec: `.scratch/sln-gpt-mvp/spec.md`
- Context: `CONTEXT.md`, `project-context.md`, ADR-0001, ADR-0002, and the supplied `starter/source/SPEC.md`

## Review layers

- BMAD Acceptance Auditor: completed
- BMAD Edge Case Hunter: completed
- Matt Pocock Standards axis: completed
- Matt Pocock Spec axis: completed
- BMAD Blind Hunter: failed because the local Codex CLI reached its usage quota; triage continued with the remaining independent layers

## Triaged patch findings

- [x] Drive parent progress from persisted mission completion.
- [x] Accept only the displayed Parent Gate answer.
- [x] Make sequence, options, answer, hints, cover, reward, and feedback editable in CMS.
- [x] Implement Save Draft and Submit for Review behaviors.
- [x] Derive gameplay progress from mission data.
- [x] Return validation errors for malformed JSON route-handler bodies.
- [x] Handle empty/non-JSON API responses without masking errors.
- [x] Recover safely from malformed localStorage progress data.
- [x] Validate that a question's correct answer exists in its options.
- [x] Attach a completed Safety Checklist to published missions.
- [x] Remove duplicate starter/public asset binaries.
- [x] Consolidate Child Profile storage keys and subscriptions.
- [x] Prevent upcoming Mission Worlds from routing to the implemented mission.
- [x] Make publish readiness depend on valid required fields and the full Safety Checklist.
- [x] Mark completed local implementation tickets as done.

## Dismissed or deferred

- Production authentication and server-side parent authorization remain out of scope for this local-first MVP. No sensitive server data is exposed by the demo route.

## Verification after patches

- Prettier check: passed
- ESLint: passed
- TypeScript: passed
- Vitest: 17/17 passed
- Next.js production build: passed
- Playwright: 7 passed, 1 intentionally skipped because the CMS acceptance reference is desktop-only
- Visual QA: landing, child flow, completion, parent dashboard and desktop CMS checked against supplied references

## Dependency audit note

`npm audit` reports two moderate entries caused by Next.js 16.2.10 pinning PostCSS 8.4.31. The npm registry reports 16.2.10 as the current Next.js release, and npm offers only an unsafe major downgrade as an automated fix. The override experiment was reverted; the project remains on the current framework release rather than introducing an invalid dependency tree.
