# Audit toàn bộ giao diện quản trị

## Phạm vi

- Kiểm tra 21 route trong khu vực `/admin`.
- Bao gồm trang danh sách, tạo mới, chỉnh sửa và chi tiết duyệt nội dung.
- Chụp ở desktop 1600×900, tablet 1024×768 và mobile 390×844.
- Kiểm tra overflow, control bị cắt, ảnh lỗi, lỗi runtime và mật độ bố cục.

## Nguyên tắc xử lý

- Sidebar desktop cuộn độc lập trong viewport.
- Tablet và mobile dùng navigation drawer để ưu tiên chiều rộng nội dung.
- Record lặp lại hiển thị tóm tắt trước, biểu mẫu mở khi cần.
- Table chỉ dùng khi đủ chiều rộng; mobile chuyển sang card có thao tác đầy đủ.
- Ảnh mang nội dung dùng `object-contain`; cover được phép dùng `object-cover`.
- Nội dung dài hoặc cấu hình nâng cao dùng progressive disclosure.

## Kết quả chấp nhận

- 63 trường hợp viewport-route được chụp và đo tự động.
- Không có body hoặc vùng nội dung bị tràn ngang.
- Không có control bị cắt ngoài viewport.
- Không có ảnh hỏng, page error hoặc console error.
- Trang cấu hình mobile giảm từ khoảng 11,8 xuống 4,2 màn hình cuộn.
- Các mục cấu hình vẫn mở được và giữ đủ form, trạng thái và nút lưu.

## Bằng chứng

- `.verification/admin-all-pages-audit/audit-desktop.json`
- `.verification/admin-all-pages-audit/audit-tablet.json`
- `.verification/admin-all-pages-audit/audit-mobile.json`
- `.verification/admin-all-pages-audit/audit-settings.json`
- `.verification/admin-all-pages-audit/contact-*-top.jpg`

Cảnh báo LCP của Next.js được ghi nhận là việc tối ưu hiệu năng tiếp theo, không phải lỗi bố cục hay ảnh hỏng.
