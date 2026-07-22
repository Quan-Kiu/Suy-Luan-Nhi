UPDATE "content_entries"
SET "value" = to_jsonb('Thông tin tự điền'::text),
    "description" = 'Điều hướng đến phần quản lý thông tin được tự điền vào nội dung dành cho Super Admin.',
    "updated_at" = now()
WHERE "namespace" = 'admin'
  AND "key" = 'nav.contentVariables'
  AND "locale" = 'vi'
  AND "value" = to_jsonb('Biến trong nội dung'::text);
