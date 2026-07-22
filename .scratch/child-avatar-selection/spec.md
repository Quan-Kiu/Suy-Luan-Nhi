# Chọn avatar cho hồ sơ bé

## Mục tiêu

Phụ huynh chọn avatar từ danh sách hình do hệ thống quản lý thay vì nhập hoặc gửi URL tùy ý.

## Quy tắc

- Chỉ hiển thị tư liệu hình ảnh thuộc nhóm `child-avatar`.
- Chỉ avatar đã được duyệt an toàn và chưa bị xóa mới được chọn.
- API tạo/cập nhật hồ sơ xác minh lại avatar ở phía máy chủ.
- Tệp đang được dùng làm avatar không thể bị xóa khỏi thư viện.
- Form tạo và chỉnh sửa đều hỗ trợ chọn avatar, có trạng thái tải, lỗi và trống.
