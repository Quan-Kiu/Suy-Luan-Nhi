# 001 — Bổ sung luồng quên mã PIN phụ huynh

**Blockers:** none

## Công việc

- Thêm UI yêu cầu khôi phục và form đặt PIN mới.
- Gửi liên kết email dùng một lần, hết hạn sau 15 phút.
- Thêm rate limit, audit và cơ chế thu hồi quyền mở bằng PIN cũ.
- Che email trên UI và không để lộ `pinHash` trong API.
- Bổ sung unit, integration và browser E2E coverage.

## Trạng thái

- [x] Đã triển khai
- [x] Đã xác minh

## Xác minh

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test -- --run src/domain/__tests__/parent-pin.test.ts` passed: 10 tests.
- PostgreSQL integration test passed: 1 test.
- Production build with Next.js webpack passed.
- Playwright desktop recovery flow passed: 1 test.
