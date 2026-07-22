# Media deletion error handling

## Problem

Deleting a media asset can fail after the UI opens a destructive confirmation dialog. The mutation error is currently rendered inside the underlying media card, so it is hidden by the modal overlay and visually disconnected from the action. The active database is also behind the schema used by the media reference query, causing every delete request to fail when `child_profiles.avatar_asset_id` has not been migrated.

## Expected behaviour

- Keep the confirmation dialog open when deletion fails.
- Show the API error inside the dialog, next to the retry action.
- Do not duplicate a deletion error underneath the media card.
- Clear stale errors when the dialog is closed and reopened.
- Apply pending Drizzle migrations before exercising the new media reference query.
- Keep review-action errors visible on the card.
