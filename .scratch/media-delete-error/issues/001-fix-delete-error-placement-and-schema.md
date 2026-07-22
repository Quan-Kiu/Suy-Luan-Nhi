# Fix media deletion failure and error placement

- Label: ready-for-human
- Blockers: none

## Acceptance criteria

- A failed delete displays one accessible error inside the open confirmation dialog.
- The destructive action can be retried without closing the dialog.
- Closing and reopening the dialog clears the old error.
- Approve/reject errors continue to render on the media card.
- The database contains `child_profiles.avatar_asset_id` before delete queries run.
- Targeted unit and browser tests pass.

## Verification

- `npx vitest run src/features/admin/__tests__/media-card.test.tsx src/domain/__tests__/media-deletion.test.ts`
- `npx playwright test e2e/media-deletion-error.desktop.spec.ts --workers=1`
- `npx eslint drizzle.config.ts src/components/confirm-dialog.tsx src/features/admin/media-card.tsx src/features/admin/__tests__/media-card.test.tsx e2e/media-deletion-error.desktop.spec.ts`
- `npm run typecheck`
