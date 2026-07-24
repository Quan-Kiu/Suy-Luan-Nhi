# Mission hints newline input

## Problem

The mission editor says each line is one hint, but pressing Enter at the end of a hint does not create a new line. The controlled textarea immediately serializes its value to the form hint array and removes the trailing empty line, so React renders the previous single-line value back into the control.

## Scope

- Preserve the textarea draft exactly while the editor is typing, including trailing newlines.
- Keep React Hook Form as the owner of the parsed hint array.
- Parse each non-empty line into one ordered hint and expose the existing maximum-three-hints validation instead of silently discarding extra hints.
- Add a regression test for pressing Enter and typing a second hint.

## Acceptance

- Pressing Enter at the end of a hint visibly moves the caret to a new line.
- Typing the second line updates `questions[0].hints` with levels 1 and 2.
- Existing mission editor behavior and validation remain intact.

## Verification

- ESLint passed.
- TypeScript passed.
- Unit suite: 247 passed, 12 skipped integration cases.
- Targeted Chromium browser test passed.
- Production build passed.
