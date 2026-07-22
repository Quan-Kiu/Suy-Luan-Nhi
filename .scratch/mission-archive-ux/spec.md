# Mission archive UX

## Problem

The mission list treats archived records like active records: the default list can still include them, the row still offers “Lưu trữ”, and there is no clear recovery path.

## Behaviour

- The default mission list excludes archived missions.
- A clear “Kho lưu trữ” shortcut opens archived missions without requiring users to understand status codes.
- Archived rows are visually distinct, read-only, and show when they were archived.
- Archived missions offer “Khôi phục” and “Tạo bản sao”; they never offer “Lưu trữ” again.
- Restoring returns the mission to a safe draft state; it does not silently republish child-facing content.
- Archiving provides an immediate “Hoàn tác” action and updates the current list without a full-page refresh.

## Verification

- Targeted TypeScript, ESLint, unit/integration checks, production build, and Playwright coverage for archive → archive view → restore.
