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

## Production follow-up — 2026-08-04

- Direct Chromium measurements against the Vercel deployment showed healthy public performance. Three cold-context landing runs produced median LCP values of about 1.43 s on desktop and 1.02 s on mobile; median CLS was 0.024 on desktop and 0 on mobile. Public/authentication route spot checks remained below about 1.1 s LCP in this lab.
- The global feedback trigger previously pulled the complete form, screenshot capture helpers, attachment tooling, and image annotator into the initial route JavaScript. The trigger now stays lightweight, the feedback dialog loads on first use, and the annotator loads only when an attachment is edited.
- The production-build landing entry changed from 22 initial JavaScript chunks / 1,469 KiB raw to 20 chunks / 1,397 KiB raw, a 72 KiB reduction (about 4.9%). Bundle inspection confirms the feedback capture and annotator markers are absent from all initial landing chunks.
- Next.js 16 image hints were migrated from the deprecated `priority` prop to `preload` for the same known above-the-fold/LCP images, preserving loading intent while matching the installed framework API.
- `npm run check` passed again after the follow-up: formatting, lint, type checking, typography and data-consistency audits, 325 unit tests, and the optimized production build.
- Authenticated Playwright was not rerun on `quan-server` because its current user cannot access the Docker socket and no local PostgreSQL service is available. The earlier full E2E matrix remains the latest authenticated browser evidence; this follow-up did not weaken the gate or alter host permissions to bypass that infrastructure constraint.

## Deferred review items

- Continue decomposing large feature components only when a functional or measured performance task justifies it; file size alone is not sufficient reason for a risky system-wide rewrite.
- Add visual-diff baselines after the product team confirms the current appearance as the approved reference.
