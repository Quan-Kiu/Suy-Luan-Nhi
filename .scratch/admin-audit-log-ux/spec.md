# Admin audit log UX

## Goal

Make the audit log practical for operational review instead of rendering a fixed block of the latest records.

## Requirements

- Paginate on the server and expose total, current page, page size, and total pages.
- Preserve filters while moving between pages.
- Filter by resource type, action, resource id, and Vietnam-local date range.
- Show the human-readable actor name and email when available.
- Present compact, date-grouped rows with expandable before/after/metadata details.
- Keep the layout usable on desktop and mobile without horizontal overflow.
