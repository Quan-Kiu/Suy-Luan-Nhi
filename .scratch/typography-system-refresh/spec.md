# Typography system refresh

## Objective

Normalize text sizing and hierarchy across public, authentication, child, parent, and administration experiences. Text styles must communicate their role consistently instead of being selected independently in each component.

## Acceptance criteria

- [x] A reusable semantic typography scale covers display, page, section, card, body, supporting, label, caption, overline, action, reading, and metric roles.
- [x] Page, section, and card headings use consistent semantic roles across all application areas.
- [x] Form labels, controls, helper text, metadata, navigation, and buttons use role-based styles.
- [x] Child-facing primary instructions remain body-sized or larger.
- [x] No visible interface text renders below 12px.
- [x] Vietnamese text keeps readable line height and wrapping on desktop and mobile.
- [x] Mobile parent navigation gives long labels a stable multi-line area without overlapping adjacent items.
- [x] A source audit prevents tiny text and static headings without a semantic role from returning.
- [x] Typography guidance is documented for future implementation.
- [x] Formatting in the typography scope, ESLint, TypeScript, unit tests, production build, and targeted desktop/mobile browser checks pass.

## Verification

- `npm run audit:typography`
- `npm run lint`
- `npm run typecheck`
- `npm run test` — 154 passed, 1 integration test skipped by default
- `npm run build`
- `e2e/typography-system.desktop.spec.ts`
- `e2e/typography-system.mobile.spec.ts`
- Screenshots: `.verification/typography-system-refresh/`
