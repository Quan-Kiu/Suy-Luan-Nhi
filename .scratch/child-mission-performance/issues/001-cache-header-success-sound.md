# Cache mission map, fix child header, improve completion cue

Status: completed

## Acceptance criteria

- Returning to `/missions` within five minutes reuses TanStack Query data.
- Server mission catalog reads use tagged cache entries and progress mutations expire them.
- The child header remains fixed at the top during vertical scrolling.
- Mission links are prefetched.
- Mission completion plays the original rising success chime.
- Targeted unit, type, lint, build, and browser checks pass.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npx vitest run src/features/sound/__tests__/sound-effects-provider.test.tsx`
- `npm run build`
- `npx playwright test e2e/child-mission-performance.desktop.spec.ts e2e/sound-effects.desktop.spec.ts --project=desktop-chromium --workers=1` (3 passed)
