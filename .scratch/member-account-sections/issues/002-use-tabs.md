# 002 — Dùng tab cho nhóm thành viên

Status: completed
Blockers: none

## Yêu cầu

- Thay hai khu vực Ban quản trị và Phụ huynh đang xếp dọc bằng hai tab rõ ràng.
- Mỗi tab hiển thị số tài khoản và chỉ render danh sách thuộc tab đang chọn.
- Giữ nguyên thông tin hình thức đăng nhập, vai trò, trạng thái và thao tác.
- Tab dùng được bằng bàn phím và không gây tràn ngang trên mobile.

## Verification

- Unit test kiểm tra chuyển tab bằng chuột, Arrow Left và Arrow Right.
- E2E desktop/mobile kiểm tra dữ liệu đúng trong từng tab và nhãn đăng nhập Google.
- Typecheck, ESLint, typography audit, data-consistency audit, toàn bộ unit test và production build đều thành công.
