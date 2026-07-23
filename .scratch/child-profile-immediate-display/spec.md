# Hiển thị hồ sơ ngay sau khi tạo

Sau khi phụ huynh tạo hồ sơ đầu tiên, ứng dụng phải chuyển về `/profiles` và hiển thị hồ sơ vừa tạo ngay lập tức, không cần tải lại trang.

Trang hồ sơ phải lấy TanStack Query cache làm nguồn dữ liệu tức thời để không bị ảnh hưởng bởi React Server Component payload đã được Next.js prefetch trước khi mutation hoàn tất.

## Tiêu chí chấp nhận

- Tạo hồ sơ đầu tiên từ onboarding hiển thị đúng hồ sơ trên `/profiles` ngay sau mutation.
- Tiêu đề và trạng thái rỗng cập nhật đồng bộ với danh sách hồ sơ.
- Luồng tạo thêm hồ sơ, sửa, xóa, khôi phục vẫn hoạt động.
- Có kiểm thử browser tái hiện luồng PIN → onboarding → tạo hồ sơ đầu tiên.
