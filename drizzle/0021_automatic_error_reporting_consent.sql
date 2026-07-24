ALTER TABLE "parent_profiles"
ALTER COLUMN "privacy_settings"
SET DEFAULT '{"analytics":true,"errorReporting":false}'::jsonb;
--> statement-breakpoint
INSERT INTO "content_entries" ("namespace", "key", "locale", "category", "value_type", "value", "description")
VALUES
  ('parent', 'settings.errorReportingTitle', 'vi', 'settings', 'text', to_jsonb('Tự động gửi báo cáo lỗi'::text), 'Nhãn cho phép tự động gửi lỗi kỹ thuật.'),
  ('parent', 'settings.errorReportingDescription', 'vi', 'settings', 'text', to_jsonb('Khi có sự cố, hệ thống gửi thông tin kỹ thuật và các bước thao tác gần nhất để đội ngũ phát triển sửa lỗi nhanh hơn. Không gửi nội dung nhập, mã PIN, ảnh hoặc thông tin riêng của bé.'::text), 'Mô tả phạm vi dữ liệu của báo cáo lỗi tự động.')
ON CONFLICT ("namespace", "key", "locale") DO NOTHING;
