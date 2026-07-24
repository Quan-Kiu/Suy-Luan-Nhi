# 002 — Đơn giản nội dung trang “Có gì mới”

Status: completed
Blockers: none

## Acceptance

- [x] Tiêu đề và mô tả chỉ giới thiệu các cập nhật mới của hệ thống.
- [x] Loại bỏ giải thích về phạm vi báo cáo và theo dõi kỹ thuật nội bộ.
- [x] Loại bỏ khối giải thích trạng thái đã xem và theo dõi cá nhân.
- [x] Loại bỏ mục cập nhật tự mô tả chức năng của chính trang “Có gì mới”.
- [x] Nội dung bản phát hành tóm tắt trực tiếp các thay đổi thực tế.
- [x] Kiểm tra định dạng, lint, kiểu dữ liệu và E2E liên quan.

## Verification

- `npx prettier --write` trên các tệp thay đổi
- `npx eslint` trên các tệp thay đổi
- `npm run typecheck`
- `npx vitest run src/modules/release-notes/release-notes.test.ts` — 2 passed
- `npx playwright test e2e/parent-release-notes.desktop.spec.ts e2e/parent-release-notes.mobile.spec.ts` — passed
- `npm run build -- --webpack` — passed
