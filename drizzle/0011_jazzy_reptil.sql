ALTER TABLE "child_profiles" ADD COLUMN "avatar_asset_id" uuid;--> statement-breakpoint
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_avatar_asset_id_media_assets_id_fk" FOREIGN KEY ("avatar_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
INSERT INTO "media_assets" (
  "id",
  "type",
  "storage_provider",
  "storage_key",
  "category",
  "url",
  "alt_text",
  "file_name",
  "mime_type",
  "size",
  "safety_status"
)
VALUES
  (
    'b071b5d0-1f48-4f1b-8b32-66537e17c001',
    'image',
    'local',
    'system/child-avatars/bong-default.png',
    'child-avatar',
    '/assets/mascots/mascot-dog-bong-avatar.png',
    'Chú chó Bống màu kem đang mỉm cười',
    'mascot-dog-bong-avatar.png',
    'image/png',
    0,
    'approved'
  ),
  (
    'b071b5d0-1f48-4f1b-8b32-66537e17c002',
    'image',
    'local',
    'system/child-avatars/detective-boy.png',
    'child-avatar',
    '/assets/mascots/mascot-detective-boy-standing.png',
    'Bạn nhỏ thám tử đang đứng chào',
    'mascot-detective-boy-standing.png',
    'image/png',
    0,
    'approved'
  ),
  (
    'b071b5d0-1f48-4f1b-8b32-66537e17c003',
    'image',
    'local',
    'system/child-avatars/hedgehog.png',
    'child-avatar',
    '/assets/mascots/mascot-hedgehog-thumbs-up.png',
    'Bạn nhím giơ ngón tay cổ vũ',
    'mascot-hedgehog-thumbs-up.png',
    'image/png',
    0,
    'approved'
  ),
  (
    'b071b5d0-1f48-4f1b-8b32-66537e17c004',
    'image',
    'local',
    'system/child-avatars/dog-detective.png',
    'child-avatar',
    '/assets/mascots/mascot-dog-detective.png',
    'Chú chó thám tử đội mũ',
    'mascot-dog-detective.png',
    'image/png',
    0,
    'approved'
  )
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "child_profiles"
SET "avatar_asset_id" = (
  SELECT "id"
  FROM "media_assets"
  WHERE "url" = '/assets/mascots/mascot-dog-bong-avatar.png'
    AND "type" = 'image'
    AND "category" = 'child-avatar'
    AND "safety_status" = 'approved'
    AND "deleted_at" IS NULL
  ORDER BY "created_at" ASC
  LIMIT 1
)
WHERE "avatar_asset_id" IS NULL
  AND "avatar_url" = '/assets/mascots/mascot-dog-bong-avatar.png';--> statement-breakpoint
INSERT INTO "content_entries" ("namespace", "key", "locale", "category", "value_type", "value", "description")
VALUES
  ('profile', 'avatar.label', 'vi', 'general', 'text', to_jsonb('Chọn avatar cho bé'::text), 'Nhãn chọn avatar hồ sơ bé.'),
  ('profile', 'avatar.description', 'vi', 'general', 'text', to_jsonb('Chọn một hình bé thích. Ba/mẹ có thể đổi lại sau.'::text), 'Mô tả khu vực chọn avatar hồ sơ bé.'),
  ('profile', 'avatar.error', 'vi', 'general', 'text', to_jsonb('Chưa tải được avatar. Hãy thử lại.'::text), 'Thông báo khi danh sách avatar không tải được.'),
  ('profile', 'avatar.loading', 'vi', 'general', 'text', to_jsonb('Đang tải avatar...'::text), 'Thông báo khi đang tải danh sách avatar.'),
  ('profile', 'avatar.empty', 'vi', 'general', 'text', to_jsonb('Hệ thống chưa có avatar phù hợp. Vui lòng liên hệ quản trị viên.'::text), 'Thông báo khi chưa có avatar đã duyệt.')
ON CONFLICT ("namespace", "key", "locale") DO NOTHING;
