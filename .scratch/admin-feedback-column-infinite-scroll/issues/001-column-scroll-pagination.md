# 001 — Column-owned scrolling and pagination

- Status: ready-for-human
- Blockers: none

## Acceptance criteria

- [x] Card count never increases page height beyond the fixed Kanban viewport.
- [x] Each status column scrolls vertically without scrolling another column or the admin main region.
- [x] Each status column loads its own next page near the bottom.
- [x] Duplicate cards are prevented across offset pages.
- [x] Drag/status updates preserve totals and recover correctly on API failure.
- [x] Desktop and tablet layouts remain horizontally contained.
- [x] Targeted unit and Playwright tests pass.
