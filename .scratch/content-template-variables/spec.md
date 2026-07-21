# Dynamic content variables

## Goal

Allow mission authors to insert safe tags such as `{{name}}` into child-facing content. Resolve tags only when content is shown for the active child.

## Requirements

- Super Admin has a dedicated dashboard page to manage variable key, label, safe data source, example, fallback, and enabled state.
- Mission fields show autocomplete after typing `{{` and also provide a visible “Chèn biến” action.
- Preview uses configured examples, such as `{{name}}` → `Bống`.
- Runtime resolves variables in mission cards, mission detail, questions, instructions, hints, and feedback.
- Unknown or disabled variables block mission saving/review with a clear Vietnamese message.
- Raw child data is limited to an allow-list of profile fields; arbitrary object paths are not supported.
