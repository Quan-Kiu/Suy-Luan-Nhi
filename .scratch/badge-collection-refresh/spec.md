# Đồng bộ bộ sưu tập huy hiệu

Sau khi bé hoàn thành nhiệm vụ và được trao huy hiệu, trang `/badges` phải hiển thị dữ liệu mới ngay trong lần điều hướng tiếp theo, không yêu cầu tải lại trình duyệt.

## Phạm vi

- Đọc bộ sưu tập huy hiệu qua API theo Child Profile đang hoạt động.
- Quản lý dữ liệu bằng TanStack Query với query key chuẩn.
- Làm mới và prefetch bộ sưu tập sau mutation hoàn thành nhiệm vụ.
- Có trạng thái tải, lỗi và kiểm thử hồi quy trên luồng production.
