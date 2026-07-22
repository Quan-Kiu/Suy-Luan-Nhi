# Mission badge configuration

## Problem

Mission persistence already supports `rewardBadgeId`, but the editor exposes it as an easy-to-miss generic select named “Phần thưởng”. Editors cannot confidently discover which badge a child receives.

## Acceptance criteria

- The create/edit mission form has a clearly titled “Huy hiệu khi hoàn thành” section.
- Editors can choose no badge or one active badge using visual, keyboard-accessible controls.
- Each badge choice shows its icon and name; the selected state is obvious.
- The currently assigned inactive badge remains visible for historical editing.
- The section links to badge management and explains what happens after mission completion.
- Existing `rewardBadgeId` persistence and validation remain unchanged.
