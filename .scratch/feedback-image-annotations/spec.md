# Feedback image attachments and annotation

## Problem

- The file picker supports `multiple`, but each new selection replaces earlier uploads.
- Users cannot mark the exact area of a screenshot or uploaded image that needs attention.
- The automatic page capture and uploaded images cannot currently coexist.

## Acceptance criteria

- Users may select several files at once or add images across multiple picker sessions.
- Existing valid attachments remain when more images are added, up to the configured limit.
- The automatic page capture may coexist with uploaded images and can be recaptured independently.
- Every attachment exposes an accessible “Đánh dấu” action.
- The annotation editor supports pointer/touch drawing, color and stroke width choices, undo, clear, cancel, and save.
- Saving creates a flattened image file that is revalidated with the feedback upload policy before submission.
- Removing, annotating, and submitting preserve attachment order and source metadata.
- Unit tests cover repeated file selection and opening the annotation editor.
