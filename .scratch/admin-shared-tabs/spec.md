# Shared admin tabs

## Goal

Use one consistent segmented-tab style across admin workspaces, matching the mission management tabs. Split the content review workspace into tabs for pending review and approved/publish-ready content.

## Acceptance criteria

- Mission management, member management, and content review use the same reusable admin tab component and visual states.
- Content review displays one tab panel at a time: pending review or approved/publish-ready.
- Each review tab shows its item count and preserves empty states.
- Tabs are keyboard accessible and expose correct selected/panel relationships.
- Existing mission filtering and member grouping behavior remain unchanged.
