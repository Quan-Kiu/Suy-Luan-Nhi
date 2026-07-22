# Admin shortcut in the parent header

## Goal

Let a Super Admin move directly from the parent workspace back to the admin workspace without signing out or navigating through another page.

## Acceptance criteria

- The parent header shows a “Trang quản trị” action only when the current account has an admin/staff role.
- The action opens `/admin` through Next.js client navigation.
- The action is available in both desktop and mobile parent navigation.
- Parent-only accounts do not see the admin action.
- The label remains editable through the parent content namespace with a safe fallback.
