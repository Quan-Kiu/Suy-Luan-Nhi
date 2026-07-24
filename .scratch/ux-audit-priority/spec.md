# UX audit priority fixes

## Goal

Resolve the highest-confidence issues found by the full code/browser/screenshot audit without changing domain behaviour.

## Scope

1. Replace the WebKit-visible native file control with an accessible custom file picker.
2. Add an explicit parent notification empty state.
3. Add meaningful route metadata using the Next.js 16 Metadata API.
4. Make the independently scrollable admin content region keyboard focusable.
5. Increase undersized high-value touch targets in gameplay, auth, parent gate, mission editor, and media actions.

## Constraints

- Preserve React Hook Form ownership of form state.
- Keep user-facing copy in the Content Registry where it is editable.
- Preserve current role and parent-gate behaviour.
- Keep mobile controls at least 44px in the smallest dimension where practical.
- Avoid horizontal overflow at 390px and iPhone safe-area regressions.
