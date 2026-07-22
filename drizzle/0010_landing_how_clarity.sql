UPDATE "content_entries"
SET "value" = to_jsonb('Bé bắt đầu ra sao?'::text),
    "description" = 'Liên kết tới phần ba bước bắt đầu.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'header.how'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint

UPDATE "content_entries"
SET "value" = to_jsonb('Xem 3 bước bắt đầu'::text),
    "description" = 'Nhãn lối tắt xem ba bước bắt đầu.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'hero.secondaryCta'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint

UPDATE "content_entries"
SET "value" = to_jsonb('Ba bước để bé bắt đầu một nhiệm vụ'::text),
    "description" = 'Tiêu đề phần ba bước bắt đầu.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'how.title'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint

UPDATE "content_entries"
SET "value" = to_jsonb('Ba mẹ tạo hồ sơ một lần. Sau đó bé chọn nhiệm vụ phù hợp, làm theo hướng dẫn và có thể nhận gợi ý bất cứ lúc nào.'::text),
    "description" = 'Mô tả tổng quan ba bước bắt đầu.',
    "updated_at" = now()
WHERE "namespace" = 'landing'
  AND "key" = 'how.description'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;--> statement-breakpoint

INSERT INTO "content_entries" ("namespace", "key", "locale", "category", "value_type", "value", "description")
VALUES
  ('landing', 'how.eyebrow', 'vi', 'how', 'text', to_jsonb('Bắt đầu rất đơn giản'::text), 'Dòng giới thiệu ngắn cho ba bước bắt đầu.'),
  ('landing', 'how.step1.title', 'vi', 'how', 'text', to_jsonb('Ba mẹ tạo hồ sơ cho bé'::text), 'Tiêu đề bước tạo hồ sơ.'),
  ('landing', 'how.step1.description', 'vi', 'how', 'text', to_jsonb('Chỉ cần tên ở nhà, nhóm tuổi và một ảnh đại diện. Không cần thông tin nhạy cảm.'::text), 'Mô tả bước tạo hồ sơ.'),
  ('landing', 'how.step2.title', 'vi', 'how', 'text', to_jsonb('Bé chọn một nhiệm vụ ngắn'::text), 'Tiêu đề bước chọn nhiệm vụ.'),
  ('landing', 'how.step2.description', 'vi', 'how', 'text', to_jsonb('Mỗi nhiệm vụ chỉ mất vài phút, có hướng dẫn rõ ràng và gợi ý khi bé cần.'::text), 'Mô tả bước bé làm nhiệm vụ.'),
  ('landing', 'how.step3.title', 'vi', 'how', 'text', to_jsonb('Ba mẹ xem bé đã luyện gì'::text), 'Tiêu đề bước xem kết quả.'),
  ('landing', 'how.step3.description', 'vi', 'how', 'text', to_jsonb('Xem kỹ năng bé vừa dùng và gợi ý đồng hành, không có xếp hạng hay so sánh.'::text), 'Mô tả bước phụ huynh xem kết quả.'),
  ('landing', 'how.note', 'vi', 'how', 'text', to_jsonb('Bé được thử lại thoải mái. Hệ thống ghi nhận nỗ lực, không phạt khi bé trả lời chưa đúng.'::text), 'Lời nhắc về cách hệ thống khuyến khích bé.')
ON CONFLICT ("namespace", "key", "locale") DO NOTHING;
