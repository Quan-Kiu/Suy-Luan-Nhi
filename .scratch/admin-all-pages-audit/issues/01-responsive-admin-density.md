# Thu gọn và chuẩn hóa responsive cho toàn bộ admin

Status: completed
Labels: ready-for-human
Blockers: none

## Vấn đề ban đầu

- Sidebar ở tablet chiếm chiều rộng làm nội dung bị nén.
- Bộ lọc nhiệm vụ bị cắt tại 1024px.
- Bảng tài khoản quản trị không dùng được trên mobile.
- Bộ chọn khu vực câu chữ cuộn ngang nhưng thiếu chỉ dẫn.
- Trang cấu hình mở toàn bộ form, tạo hơn 11 màn hình cuộn trên mobile.
- Một số metadata nhiệm vụ dùng cỡ chữ nhỏ hơn hệ thống typography.

## Xử lý

- Chuyển breakpoint sidebar cố định từ `lg` sang `xl`.
- Cho bộ lọc nhiệm vụ dùng lưới trung gian hai cột.
- Thêm card mobile cho tài khoản và giữ table từ `md`.
- Thêm hướng dẫn vuốt và giảm chiều rộng card câu chữ.
- Thu gọn cấu hình hệ thống và chính sách ảnh bằng `details/summary`.
- Chuẩn hóa metadata nhiệm vụ bằng `type-caption`.

## Acceptance

- [x] 21 route được kiểm tra ở ba viewport.
- [x] Không có horizontal overflow ở shell và main.
- [x] Không có control bị che hoặc cắt ngoài viewport.
- [x] Không có ảnh hỏng hoặc lỗi runtime.
- [x] Navigation tablet/mobile hoạt động bằng drawer.
- [x] Cấu hình mở rộng vẫn thao tác và lưu được.
- [x] Unit test, typecheck, lint và browser acceptance liên quan vượt qua.

## Theo dõi sau

- Thêm `loading="eager"` hoặc `priority` có chọn lọc cho một số ảnh LCP phía trên fold sau khi đo hiệu năng thực tế.
