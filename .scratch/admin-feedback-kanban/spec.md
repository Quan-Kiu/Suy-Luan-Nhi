# Admin feedback Kanban

## Goal

Replace the repetitive full-width feedback rows with a compact Kanban workspace that makes status and workload visible at a glance.

## Acceptance criteria

- Render one responsive column for each feedback status with an item count.
- Render feedback as compact cards with title, summary, author, time, and attachment count.
- Allow staff to move a card between status columns using drag and drop.
- Persist a dropped status immediately with an optimistic cache update and rollback on failure.
- Keep a keyboard/touch-friendly status select in an accessible details dialog.
- Preserve full feedback content, page context, attachments, and internal notes in the details dialog.
- Avoid page-level horizontal overflow on tablet/mobile; the board may scroll inside its own region.
- Cover the card/dialog behavior with unit tests and the drag workflow with Playwright.
