# Xác thực hai lớp cho tài khoản quản trị đăng nhập Google

## Mục tiêu

Cho phép tài khoản nhân sự chỉ liên kết Google thiết lập TOTP mà không bị yêu cầu một mật khẩu nội bộ không tồn tại, đồng thời vẫn bắt buộc kiểm tra mật khẩu với tài khoản có thông tin đăng nhập email/mật khẩu.

## Tiêu chí chấp nhận

- Tài khoản Google-only không nhìn thấy trường “Mật khẩu hiện tại”.
- Phiên Google hiện tại được dùng để bắt đầu thiết lập TOTP.
- Tài khoản có credential vẫn phải nhập đúng mật khẩu hiện tại.
- Không làm yếu việc xác minh mã TOTP và mã dự phòng.
- Có unit/component coverage cho cả hai loại tài khoản.
