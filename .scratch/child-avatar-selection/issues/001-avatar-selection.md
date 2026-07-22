# 001 — Kết nối thư viện avatar với hồ sơ bé

- Status: done
- Blockers: none

## Acceptance

- Quản trị viên có thể tải ảnh vào nhóm Avatar bé và duyệt ảnh.
- Phụ huynh chỉ thấy avatar đã duyệt.
- Avatar được lưu bằng cả media asset id và URL hiển thị.
- Tạo/cập nhật bằng asset không hợp lệ bị từ chối.
- Có kiểm thử schema, chính sách xóa media và form chọn avatar.

## Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- 16 focused Vitest cases: passed.
- Playwright create/change/display avatar flow: passed.
- Production build in an isolated workspace copy: passed.
