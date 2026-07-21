# Child mission navigation performance

## Goals

- Keep the child header visible while the mission content scrolls.
- Reuse mission-map data for repeat visits instead of querying on every page entry.
- Invalidate only the affected child cache after completion or progress reset.
- Prefetch mission detail routes and refresh the mission-map query in the background.
- Replace the ambiguous completion sound with a clearly rising celebratory cue.
