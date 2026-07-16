import { desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, mediaAssets, missions, missionVersions, questions } from "@/db/schema";
import { deleteStoredMedia, storeMedia } from "@/modules/media/storage";

export async function listMedia() {
  return db.query.mediaAssets.findMany({
    where: isNull(mediaAssets.deletedAt),
    orderBy: [desc(mediaAssets.createdAt)],
  });
}

export async function uploadMedia(file: File, altText: string, actorId: string) {
  if (!altText.trim()) throw new Error("Alt text là bắt buộc để đảm bảo khả năng tiếp cận");
  const stored = await storeMedia(file);
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      type: stored.mediaType,
      storageKey: stored.storageKey,
      url: stored.url,
      altText: altText.trim(),
      fileName: file.name,
      mimeType: stored.mimeType,
      size: stored.buffer.length,
      uploadedBy: actorId,
      safetyStatus: "pending",
    })
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "media.uploaded",
    resourceType: "media_asset",
    resourceId: asset.id,
    afterState: { ...asset, storageKey: "[stored]" },
  });
  return asset;
}

export async function deleteMedia(mediaId: string, actorId: string) {
  const asset = await db.query.mediaAssets.findFirst({ where: eq(mediaAssets.id, mediaId) });
  if (!asset || asset.deletedAt) return false;
  const [references] = await db
    .select({
      missionCovers: sql<number>`(select count(*)::int from ${missions} where ${missions.coverUrl} = ${asset.url})`,
      questionPayloads: sql<number>`(select count(*)::int from ${questions} where ${questions.payload}::text like ${`%${asset.url}%`})`,
      versionSnapshots: sql<number>`(select count(*)::int from ${missionVersions} where ${missionVersions.snapshot}::text like ${`%${asset.url}%`} and ${missionVersions.status} in ('in_review','approved','published'))`,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId));
  if (
    (references?.missionCovers ?? 0) +
      (references?.questionPayloads ?? 0) +
      (references?.versionSnapshots ?? 0) >
    0
  ) {
    throw new Error(
      "Media đang được dùng trong nhiệm vụ hoặc phiên bản nội dung; hãy thay thế trước khi xóa",
    );
  }
  await deleteStoredMedia(asset.storageKey);
  await db.update(mediaAssets).set({ deletedAt: new Date() }).where(eq(mediaAssets.id, mediaId));
  await db.insert(auditLogs).values({
    actorId,
    action: "media.deleted",
    resourceType: "media_asset",
    resourceId: mediaId,
    beforeState: asset,
  });
  return true;
}

export async function approveMedia(mediaId: string, actorId: string, approved: boolean) {
  const [asset] = await db
    .update(mediaAssets)
    .set({ safetyStatus: approved ? "approved" : "rejected" })
    .where(eq(mediaAssets.id, mediaId))
    .returning();
  if (!asset) return null;
  await db.insert(auditLogs).values({
    actorId,
    action: approved ? "media.approved" : "media.rejected",
    resourceType: "media_asset",
    resourceId: mediaId,
  });
  return asset;
}
