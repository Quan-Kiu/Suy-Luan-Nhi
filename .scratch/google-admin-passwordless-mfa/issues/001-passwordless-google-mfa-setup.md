# 001 — Hỗ trợ MFA cho quản trị viên chỉ đăng nhập Google

**Blockers:** none

## Công việc

- Cho phép tài khoản không có credential password bắt đầu thiết lập TOTP.
- Giữ xác nhận mật khẩu cho tài khoản email/password.
- Ghi trạng thái đã xác minh MFA trên từng session.
- Chặn trang và API quản trị khi session chưa hoàn tất bước hai.
- Thêm migration, unit/component test và browser E2E.

## Trạng thái

- [x] Đã triển khai
- [x] Đã xác minh

## Xác minh

- `npm run typecheck` passed.
- `npm run lint` passed.
- Typography và data-consistency audit passed.
- Unit/component suite passed: 218 tests; 7 integration-gated tests skipped.
- Production build bằng Next.js Webpack passed.
- Playwright desktop passed: Google-only admin thiết lập TOTP không cần mật khẩu, session mới bị bắt nhập mã và được đánh dấu sau xác minh.
