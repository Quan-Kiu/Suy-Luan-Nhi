UPDATE "content_entries"
SET "value" = to_jsonb('Xin chào, ba mẹ!'::text),
    "description" = 'Lời chào thân thiện ở tổng quan phụ huynh.',
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'dashboard.greeting'
  AND "locale" = 'vi'
  AND "value" = to_jsonb('Xin chào, {parentName}'::text);

UPDATE "content_entries"
SET "value" = to_jsonb('Tuần này của {childName}'::text),
    "description" = 'Tiêu đề tổng quan tuần hiện tại của bé.',
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'dashboard.weekTitle'
  AND "locale" = 'vi'
  AND "value" = to_jsonb('Tuần của {childName}'::text);
