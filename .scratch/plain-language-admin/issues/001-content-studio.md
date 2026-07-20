# 001 — Plain-language Content Studio

Status: completed
Blockers: none

## Acceptance criteria

- Staff choose a human-readable product area instead of a technical namespace.
- Category codes are always shown with Vietnamese task labels.
- Technical keys and locale are hidden under an advanced details disclosure.
- Each item explains where it appears and what kind of copy it is.
- Editors can compare customized copy with the product default.
- Editors can reset an override to the product default with confirmation.
- Review-only staff receive a clear explanation instead of disabled unexplained controls.
- Loading, error, empty, success, and pagination states remain accessible.
- Mobile layout does not require horizontal scanning.
- Targeted unit and browser regression tests cover labels, reset, filters, and mobile layout.

## Verification

- Plain-language Content Studio desktop: 3 browser tests passed.
- Plain-language Content Studio mobile: 1 browser test passed with no document overflow.
- Admin operations: 8 browser tests passed across author, reviewer, parent denial and super-admin settings.
- Resource navigation regression: 1 browser test passed.
- Unit tests: 75 passed; PostgreSQL integration: 1 passed.
- Format, ESLint, TypeScript and production build passed.
