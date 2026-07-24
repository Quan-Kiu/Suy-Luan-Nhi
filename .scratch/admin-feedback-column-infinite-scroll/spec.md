# Admin feedback column infinite scroll

## Goal

Keep the admin feedback Kanban inside the available viewport. Each status column owns its vertical scroll and loads its next page independently.

## Behaviour

- The board may scroll horizontally on narrow screens, but the whole admin page must not grow with card count.
- Every column has a fixed responsive height, a non-scrolling header, and an internal `overflow-y-auto` card list.
- The first page for all four statuses is rendered on the server.
- Each column requests page 2+ only when its own scroll area approaches the bottom.
- Loading, retry, end-of-list, total count, drag-and-drop, details, and optimistic status updates remain independent per column.
- Moving a card updates source and target caches immediately, then refetches those columns to restore offset-pagination consistency.

## Verification

- Unit test independent next-page loading and status mutation.
- Playwright verifies column scroll does not move `admin-main-content`, page 2 is requested, and newly loaded cards render.
- Run formatting, TypeScript, ESLint, targeted unit tests, targeted Playwright, and production build when repository state permits.
