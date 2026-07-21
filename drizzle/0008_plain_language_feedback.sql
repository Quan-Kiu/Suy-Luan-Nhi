UPDATE "content_entries"
SET "value" = to_jsonb('Chưa chính xác'::text),
    "description" = 'Tiêu đề khi câu trả lời chưa đúng.',
    "updated_at" = now()
WHERE "namespace" = 'gameplay'
  AND "key" = 'feedback.retryTitle'
  AND ("value" #>> '{}') ~* 'chưa (trúng|chúng)';--> statement-breakpoint

UPDATE "questions"
SET "feedback_incorrect" = regexp_replace(
      "feedback_incorrect",
      'chưa (trúng|chúng)( thôi)?!?',
      'Chưa chính xác.',
      'gi'
    )
WHERE "feedback_incorrect" ~* 'chưa (trúng|chúng)';--> statement-breakpoint

UPDATE "mission_versions"
SET "snapshot" = regexp_replace(
      "snapshot"::text,
      'chưa (trúng|chúng)( thôi)?!?',
      'Chưa chính xác.',
      'gi'
    )::jsonb
WHERE "snapshot"::text ~* 'chưa (trúng|chúng)';--> statement-breakpoint

UPDATE "parent_resources"
SET "title" = 'Khi bé chưa trả lời đúng',
    "excerpt" = 'Ba cách nói giúp bé tiếp tục suy nghĩ mà không thấy bị chê.',
    "content" = 'Hãy mô tả điều bé đã làm tốt trước. Sau đó đặt một câu hỏi nhỏ như ''Con muốn nhìn lại phần nào?''. Tránh nói đáp án ngay; cho bé thời gian thử một cách khác.',
    "updated_at" = now()
WHERE "slug" = 'dong-hanh-khi-be-chua-tra-loi-dung';--> statement-breakpoint
DELETE FROM "parent_resources" AS legacy
WHERE legacy."slug" = 'dong-hanh-khi-be-chua-trung'
  AND EXISTS (
    SELECT 1
    FROM "parent_resources" AS current
    WHERE current."slug" = 'dong-hanh-khi-be-chua-tra-loi-dung'
  );--> statement-breakpoint

UPDATE "parent_resources"
SET "slug" = 'dong-hanh-khi-be-chua-tra-loi-dung',
    "title" = 'Khi bé chưa trả lời đúng',
    "excerpt" = 'Ba cách nói giúp bé tiếp tục suy nghĩ mà không thấy bị chê.',
    "content" = 'Hãy mô tả điều bé đã làm tốt trước. Sau đó đặt một câu hỏi nhỏ như ''Con muốn nhìn lại phần nào?''. Tránh nói đáp án ngay; cho bé thời gian thử một cách khác.',
    "updated_at" = now()
WHERE "slug" = 'dong-hanh-khi-be-chua-trung';
