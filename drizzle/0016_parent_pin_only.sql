DELETE FROM "content_entries"
WHERE "namespace" = 'parent'
  AND "locale" = 'vi'
  AND "key" IN ('gate.mathQuestion', 'gate.answerPlaceholder');
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Sau khi xác minh email, ba mẹ sẽ tạo mã PIN rồi thiết lập hồ sơ cho bé.'::text),
    "description" = 'Mô tả rõ các bước tiếp theo sau khi tạo tài khoản.',
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'signUp.pageSubtitle'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Tài khoản'::text),
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'signUp.stepAccount'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Hồ sơ bé'::text),
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'signUp.stepProfile'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Kiểm tra email để tiếp tục thiết lập'::text),
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'verification.signUpFlowTitle'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Tài khoản đã được tạo. Hãy xác minh email, sau đó quay lại để tạo mã PIN và hồ sơ cho bé.'::text),
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'verification.signUpFlowDescription'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Quay lại Suy Luận Nhí và tiếp tục thiết lập'::text),
    "updated_at" = now()
WHERE "namespace" = 'auth'
  AND "key" = 'verification.signUpFlowReturn'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Bước 3/3 · Hồ sơ của bé'::text),
    "updated_at" = now()
WHERE "namespace" = 'profile'
  AND "key" IN ('create.firstProfileBadge', 'list.emptyPageBadge')
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Tài khoản và mã PIN đã sẵn sàng. Chỉ cần tên ở nhà và nhóm tuổi để bắt đầu.'::text),
    "updated_at" = now()
WHERE "namespace" = 'profile'
  AND "key" = 'create.firstProfileDescription'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Tài khoản và mã PIN đã sẵn sàng. Thêm hồ sơ đầu tiên để bé bắt đầu khám phá.'::text),
    "updated_at" = now()
WHERE "namespace" = 'profile'
  AND "key" = 'list.emptyPageDescription'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Nhập mã PIN để xem tiến độ và quản lý cài đặt gia đình.'::text),
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'gate.description'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Ba/mẹ nhập mã PIN để tiếp tục'::text),
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'gate.confirmTitle'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Mã PIN phụ huynh'::text),
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'gate.pinPrompt'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Nhập mã PIN'::text),
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'gate.pinPlaceholder'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
--> statement-breakpoint
UPDATE "content_entries"
SET "value" = to_jsonb('Đổi mã PIN 6 chữ số dùng để mở khu vực phụ huynh.'::text),
    "updated_at" = now()
WHERE "namespace" = 'parent'
  AND "key" = 'settings.pinDescription'
  AND "locale" = 'vi'
  AND "updated_by" IS NULL;
