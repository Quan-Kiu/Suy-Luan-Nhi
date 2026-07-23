UPDATE "content_entries"
SET "value" = to_jsonb('Khu vực phụ huynh'::text),
    "description" = 'Liên kết mở khu vực dành riêng cho tài khoản phụ huynh đã đăng nhập.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'header.manageFamily'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Vào khu vực phụ huynh'::text),
    "description" = 'Hành động mở khu vực dành riêng cho Parent Account đã đăng nhập.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'hero.manageFamily'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
