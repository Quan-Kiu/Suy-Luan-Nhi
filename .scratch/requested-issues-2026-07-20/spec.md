# Requested issue resolution — 2026-07-20

## Data integrity and platform

- [x] Mission edit preserves gameplay history and the reported mission saves without HTTP 500.
- [x] Published child content remains on its approved snapshot while a new draft is edited.
- [x] Product age range is consistently 6–12 (`6-8`, `9-10`, `11-12`).
- [x] Storage uses replaceable local, S3 and Cloudinary providers for images, audio and video.
- [x] Content, mission, media and resource collections use filters and bounded pagination.

## Parent and child experience

- [x] Profile cards remain readable on mobile and expose a prominent child-area CTA.
- [x] Parent Gate supports PIN or a signed random arithmetic challenge and relocks after leaving.
- [x] Parent header is sticky and provides a direct return to the child area.
- [x] Thinking-skill labels are Vietnamese in parent and child surfaces.
- [x] Multiple-choice answers are centered and balanced.
- [x] Placement questions support mouse, touch and keyboard-accessible drag-and-drop.

## Administration and UX

- [x] Native JavaScript alerts/confirms are replaced by accessible reusable modals.
- [x] Mission/content/media/resource filtering keeps the admin shell mounted and loads locally.
- [x] Parent resources have complete list/create/edit/archive administration.
- [x] Dropdowns use a consistent custom chevron with safe right padding.
- [x] Error boundaries include Retry and layout-aware Back actions.
- [x] Desktop regression, production mobile-critical, unit, integration and production build gates pass.
