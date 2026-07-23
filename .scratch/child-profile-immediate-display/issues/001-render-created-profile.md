# Hiển thị hồ sơ vừa tạo

Trạng thái rỗng của `/profiles` đang được quyết định hoàn toàn ở Server Component. Link quay lại `/profiles` trên onboarding đã prefetch payload rỗng trước khi hồ sơ được tạo, nên `router.push()` có thể dùng lại payload cũ dù API đã lưu thành công.

Chuyển phần hiển thị trạng thái rỗng/danh sách sang lớp client dùng query key chuẩn `queryKeys.children.list`. Mutation tạo hồ sơ đã ghi hồ sơ mới vào cache, vì vậy trang đích phải đọc cache đó ngay khi mount.

Trạng thái: ready-for-human

## Kết quả

- Trang `/profiles` luôn mount workspace dùng `queryKeys.children.list`.
- Việc khởi tạo hồ sơ phụ huynh dùng `ON CONFLICT DO NOTHING` để hai request song song sau chuyển trang không gây lỗi unique key.
- Cache được mutation tạo hồ sơ cập nhật được ưu tiên trước props Server Component cũ.
- Tiêu đề, trạng thái rỗng và danh sách hồ sơ cùng đọc một nguồn dữ liệu.

## Xác minh

- Unit test cache mới: đạt.
- E2E luồng mobile viewport PIN → `/profiles` rỗng → onboarding → tạo hồ sơ, bao gồm hai request setup song song: đạt.
- E2E sửa/xóa/khôi phục/xóa vĩnh viễn hồ sơ hiện có: đạt.
- TypeScript, ESLint và production build: đạt.
