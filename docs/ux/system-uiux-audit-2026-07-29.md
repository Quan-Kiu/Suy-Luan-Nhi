# System UI/UX audit — 2026-07-29

## Scope

The audit covers the public landing and authentication flows, child mission selection and gameplay, parent pages, and all administration roles. Evidence is collected at desktop, tablet, and mobile viewports. Automated checks include route status, browser and server errors, failed requests, horizontal overflow, serious WCAG violations, screenshots, document height, and route duration.

## Baseline evidence

The pre-refactor suite completed with 9/9 Playwright scenarios passing in 6 minutes 48 seconds. The administration matrix captured 21 routes across desktop, tablet, and mobile, for 63 administration states. Existing evidence remains under `.verification/admin-all-pages-audit/` and `.verification/deep-review-2026-07-18/screenshots/`.

## Confirmed findings

### High priority

1. Landing sections were emitted with `opacity: 0` until `whileInView` executed. Full-page screenshots therefore showed large blank sections, and the same markup was fragile when JavaScript or viewport observation was delayed.
2. The global feedback action floated over page content on narrow screens. It obscured card controls and values in both parent and administration screenshots.
3. Locked mission worlds applied opacity and grayscale to entire sections. Once the hidden-entry animation was removed, axe exposed text contrast ratios as low as 2.85:1.
4. Development-mode LCP warnings appeared after forced screenshot scrolling. Review showed that eager-loading every warned image would load below-the-fold content unnecessarily, so these warnings are retained as audit context rather than treated as production Web Vitals evidence.

### Audit reliability

1. The screenshot output path was tied to a stale date.
2. Full-page capture did not warm below-the-fold content before taking evidence.
3. The Next.js development indicator polluted screenshots.
4. Mobile gameplay was audited without a screenshot, and several parent/authentication routes were absent from the mobile matrix.
5. Administration evidence was written to a shared folder instead of a per-run folder.

## Refactor applied

- Landing information cards and child mission-map cards now remain visible in the initial render; hover motion is retained without hiding meaningful content.
- Locked mission text keeps full contrast; only the illustrative image is visually muted, preserving the locked state without degrading readability.
- The compact feedback action is docked to the mobile viewport edge, remains at least 44 px, and returns to the full pill treatment at the `sm` breakpoint.
- Audit evidence uses `UI_AUDIT_RUN_ID`, creates its own directory, records route duration and document height, hides only the Next.js development portal, and scrolls the document before full-page capture.
- Mobile coverage now includes forgot/reset password, onboarding, gameplay screenshots, parent activity, resources and resource detail, suggestions, notifications, settings, and release notes.
- Focused visual assertions protect initial landing visibility and the docked 44–48 px mobile feedback trigger.

## Verification

Final evidence is written to `.verification/uiux-audit-2026-07-29-final/`.

- Full Playwright matrix: 9/9 scenarios passed in 7 minutes 51 seconds.
- Administration refresh after removing development overlays: 21 routes across 3 viewports, producing 63 measured states; 1/1 scenario passed in 2 minutes 46 seconds.
- Evidence set: 167 screenshots and 68 JSON result files, including 67 system-flow screenshots and 100 administration top/bottom screenshots.
- Shared screenshot-helper smoke test: public and authentication routes passed 1/1 in 40.1 seconds after the helper refactor.
- Focused mobile regression: parent, child, gameplay, and parent-resource routes passed 1/1 in 1 minute 54 seconds with the feedback target constrained to 44–48 px.
- `npm run check`: formatting, lint, type checking, typography audit, data-consistency audit, 325 unit tests, and the optimized production build passed.
- Data ownership audit: 59 mutation routes, with 38 explicit invalidations and 21 documented intentionally local mutations.
- The test runner skipped 27 integration tests whose database-specific opt-in environment was not enabled; the Playwright matrix used the isolated E2E PostgreSQL database and passed separately.

## Deferred review items

- Validate production Web Vitals with real network and CDN behavior; development-server timings are useful for regressions but are not production performance measurements.
- Continue decomposing the largest feature components only when a functional task touches them; file size alone is not sufficient justification for a risky system-wide rewrite.
- Add visual-diff baselines after the product team confirms the current appearance as the approved reference.
