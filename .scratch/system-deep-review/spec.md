# System deep review

## Objective

Perform a production-readiness review of the complete Suy Luận Nhí system, covering user experience, authorization, data integrity, accessibility, responsiveness, failure states, and deployment behavior.

## Review surfaces

- Public landing and authentication.
- Parent Account and Child Profile lifecycle.
- Child mission discovery, gameplay, hints, retries, completion, and rewards.
- Parent Gate, activity, notifications, resources, suggestions, settings, export, and deletion.
- Content editor, reviewer, and super-admin workflows.
- Shared content registry, media storage, scheduled publication, audit, and role boundaries.
- Desktop and mobile layouts, keyboard navigation, reduced motion, overflow, and persistent shells.

## Evidence requirements

- Store command logs under `.verification/deep-review-2026-07-18/`.
- Capture representative screenshots for every major role and workflow.
- Record route, console, network, accessibility, and viewport findings.
- Add regression tests for every confirmed issue with a stable public seam.
- Separate verified defects from observations requiring human judgment.
