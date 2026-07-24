UPDATE "content_entries"
SET "value" = to_jsonb('Nội dung hiển thị'::text),
    "description" = 'Điều hướng đến phần quản lý nội dung hiển thị trong ứng dụng.',
    "updated_at" = now()
WHERE "namespace" = 'admin'
  AND "key" = 'nav.content'
  AND "locale" = 'vi'
  AND "value" = to_jsonb('Câu chữ hiển thị'::text);
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Từ điển'::text),
    "description" = 'Điều hướng đến từ điển tư liệu.',
    "updated_at" = now()
WHERE "namespace" = 'admin'
  AND "key" = 'nav.media'
  AND "locale" = 'vi'
  AND "value" IN (
    to_jsonb('Thư viện tư liệu'::text),
    to_jsonb('Hình ảnh và âm thanh'::text)
  );
