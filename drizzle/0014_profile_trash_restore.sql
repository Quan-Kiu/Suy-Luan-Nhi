UPDATE "content_entries"
SET "value" = to_jsonb('Hồ sơ sẽ tạm thời bị ẩn. Ba/mẹ có thể khôi phục trong mục Hồ sơ đã xóa.'::text),
    "description" = 'Giải thích việc đưa hồ sơ bé vào thùng rác.',
    "updated_at" = now()
WHERE "namespace" = 'profile'
  AND "key" = 'list.deleteConfirm'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Đã đưa hồ sơ vào thùng rác'::text),
    "description" = 'Thông báo xóa mềm hồ sơ.',
    "updated_at" = now()
WHERE "namespace" = 'profile'
  AND "key" = 'list.deleteSuccess'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint
INSERT INTO "content_entries" ("namespace", "key", "locale", "category", "value_type", "value", "description")
VALUES
  ('profile', 'list.deleteConfirmLabel', 'vi', 'general', 'text', to_jsonb('Đưa vào thùng rác'::text), 'Nhãn xác nhận đưa hồ sơ bé vào thùng rác.'),
  ('profile', 'list.deleteCancelLabel', 'vi', 'general', 'text', to_jsonb('Giữ lại'::text), 'Nhãn hủy thao tác xóa hồ sơ bé.'),
  ('profile', 'list.deletePending', 'vi', 'general', 'text', to_jsonb('Đang chuyển...'::text), 'Nhãn khi đang đưa hồ sơ vào thùng rác.'),
  ('profile', 'list.noActiveProfiles', 'vi', 'general', 'text', to_jsonb('Hiện chưa có hồ sơ đang sử dụng'::text), 'Tiêu đề khi chỉ còn hồ sơ trong thùng rác.'),
  ('profile', 'list.noActiveProfilesDescription', 'vi', 'general', 'text', to_jsonb('Ba/mẹ có thể tạo hồ sơ mới hoặc khôi phục một hồ sơ bên dưới.'::text), 'Hướng dẫn khi chỉ còn hồ sơ trong thùng rác.'),
  ('profile', 'trash.title', 'vi', 'general', 'text', to_jsonb('Hồ sơ đã xóa'::text), 'Tiêu đề khu vực hồ sơ đã xóa.'),
  ('profile', 'trash.description', 'vi', 'general', 'text', to_jsonb('Ba/mẹ có thể khôi phục hoặc xóa vĩnh viễn các hồ sơ ở đây.'::text), 'Mô tả khu vực hồ sơ đã xóa.'),
  ('profile', 'trash.deletedAt', 'vi', 'general', 'text', to_jsonb('Đưa vào thùng rác lúc'::text), 'Nhãn thời điểm xóa mềm hồ sơ.'),
  ('profile', 'trash.restore', 'vi', 'general', 'text', to_jsonb('Khôi phục'::text), 'Nhãn khôi phục hồ sơ bé.'),
  ('profile', 'trash.restoreSuccess', 'vi', 'general', 'text', to_jsonb('Đã khôi phục hồ sơ'::text), 'Thông báo khôi phục hồ sơ.'),
  ('profile', 'trash.undo', 'vi', 'general', 'text', to_jsonb('Hoàn tác'::text), 'Nhãn hoàn tác ngay sau khi xóa mềm hồ sơ.'),
  ('profile', 'trash.deleteForever', 'vi', 'general', 'text', to_jsonb('Xóa vĩnh viễn'::text), 'Nhãn xóa vĩnh viễn hồ sơ bé.'),
  ('profile', 'trash.deleteForeverConfirm', 'vi', 'general', 'text', to_jsonb('Toàn bộ tiến độ và dữ liệu của hồ sơ sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.'::text), 'Cảnh báo trước khi xóa vĩnh viễn hồ sơ bé.'),
  ('profile', 'trash.deleteForeverCancel', 'vi', 'general', 'text', to_jsonb('Giữ lại'::text), 'Nhãn hủy xóa vĩnh viễn hồ sơ.'),
  ('profile', 'trash.deleteForeverPending', 'vi', 'general', 'text', to_jsonb('Đang xóa...'::text), 'Nhãn khi đang xóa vĩnh viễn hồ sơ.'),
  ('profile', 'trash.deleteForeverSuccess', 'vi', 'general', 'text', to_jsonb('Đã xóa vĩnh viễn hồ sơ'::text), 'Thông báo xóa vĩnh viễn hồ sơ thành công.')
ON CONFLICT ("namespace", "key", "locale") DO NOTHING;
