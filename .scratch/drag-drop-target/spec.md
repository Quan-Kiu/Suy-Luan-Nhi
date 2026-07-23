# Drag-drop target behavior

## Problem

- Releasing an answer outside every answer slot currently assigns it to the nearest slot because `closestCenter` always resolves a collision.
- Assigned slots only show a check mark, so the child cannot visually confirm which image was placed.

## Expected behavior

- Pointer/touch drops are accepted only while the pointer is inside a slot.
- Keyboard dragging keeps a rectangle-intersection fallback.
- A successful assignment displays the assigned answer image and label inside the slot.
- Dropping outside leaves assignments unchanged.

## Verification

- Unit test strict pointer collision inside/outside behavior.
- Run targeted Vitest, ESLint, TypeScript, and formatting checks.
