# Admin form layout stability

## Goal

Make admin form controls align consistently across desktop and mobile, avoid layout shifts when helper/error text appears, and prevent action areas from covering unfinished fields.

## Acceptance criteria

- Reusable form fields place helper/error text in a stable message slot below the control.
- Select fields expose helper/error text through `aria-describedby`.
- Media upload controls share one visual baseline and use Vietnamese file-picker text.
- The selected filename is visible without relying on the browser-native English control.
- The content-variable save action does not cover fields while scrolling.
- Desktop Playwright checks confirm aligned control positions and no overlap.
