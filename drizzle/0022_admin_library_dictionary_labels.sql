UPDATE "content_entries"
SET "value" = to_jsonb('Thư viện'::text),
    "description" = 'Điều hướng đến thư viện hình ảnh, âm thanh và video.',
    "updated_at" = now()
WHERE "namespace" = 'admin'
  AND "key" = 'nav.media'
  AND "locale" = 'vi'
  AND "value" IN (
    to_jsonb('Từ điển'::text),
    to_jsonb('Thư viện tư liệu'::text),
    to_jsonb('Hình ảnh và âm thanh'::text)
  );
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Từ điển'::text),
    "description" = 'Điều hướng đến từ điển tag dùng để tự điền thông tin vào nội dung dành cho Super Admin.',
    "updated_at" = now()
WHERE "namespace" = 'admin'
  AND "key" = 'nav.contentVariables'
  AND "locale" = 'vi'
  AND "value" IN (
    to_jsonb('Thông tin từ điển'::text),
    to_jsonb('Thông tin tự điền'::text),
    to_jsonb('Biến trong nội dung'::text)
  );
