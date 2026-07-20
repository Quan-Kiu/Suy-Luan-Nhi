import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  auditLogs,
  mediaAssets,
  missions,
  missionVersions,
  missionWorlds,
  parentResources,
  questions,
} from "@/db/schema";
import { deleteStoredMedia, storeMedia } from "@/modules/media/storage";

export type MediaListFilters = {
  type?: "image" | "audio" | "video";
  category?: string;
  safetyStatus?: "pending" | "approved" | "rejected";
  storageProvider?: "local" | "s3" | "cloudinary";
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listMedia(filters: MediaListFilters = {}) {
  const conditions = [isNull(mediaAssets.deletedAt)];
  if (filters.type) conditions.push(eq(mediaAssets.type, filters.type));
  if (filters.category) conditions.push(eq(mediaAssets.category, filters.category));
  if (filters.safetyStatus) conditions.push(eq(mediaAssets.safetyStatus, filters.safetyStatus));
  if (filters.storageProvider) conditions.push(eq(mediaAssets.storageProvider, filters.storageProvider));
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    conditions.push(
      sql`(${mediaAssets.fileName} ilike ${`%${search}%`} or ${mediaAssets.altText} ilike ${`%${search}%`})`,
    );
  }
  const where = and(...conditions);
  const pageSize = Math.min(48, Math.max(8, Math.trunc(filters.pageSize ?? 16)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const [items, countRows, facetRows] = await Promise.all([
    db.query.mediaAssets.findMany({
      where,
      orderBy: [desc(mediaAssets.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(mediaAssets)
      .where(where),
    db
      .select({
        type: mediaAssets.type,
        category: mediaAssets.category,
        safetyStatus: mediaAssets.safetyStatus,
        storageProvider: mediaAssets.storageProvider,
      })
      .from(mediaAssets)
      .where(isNull(mediaAssets.deletedAt)),
  ]);
  const total = countRows[0]?.count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    facets: {
      types: [...new Set(facetRows.map((row) => row.type))],
      categories: [...new Set(facetRows.map((row) => row.category))].sort(),
      safetyStatuses: [...new Set(facetRows.map((row) => row.safetyStatus))],
      storageProviders: [...new Set(facetRows.map((row) => row.storageProvider))],
    },
  };
}

export async function uploadMedia(file: File, altText: string, category: string, actorId: string) {
  if (!altText.trim()) throw new Error("Alt text là bắt buộc để đảm bảo khả năng tiếp cận");
  const stored = await storeMedia(file);
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      type: stored.mediaType,
      storageProvider: stored.provider,
      storageKey: stored.storageKey,
      storageMetadata: stored.metadata,
      category,
      url: stored.url,
      altText: altText.trim(),
      fileName: file.name,
      mimeType: stored.mimeType,
      size: stored.size,
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
      worldCovers: sql<number>`(select count(*)::int from ${missionWorlds} where ${missionWorlds.coverUrl} = ${asset.url})`,
      resourceMedia: sql<number>`(select count(*)::int from ${parentResources} where ${parentResources.coverUrl} = ${asset.url} or ${parentResources.mediaUrl} = ${asset.url})`,
      questionPayloads: sql<number>`(select count(*)::int from ${questions} where ${questions.payload}::text like ${`%${asset.url}%`})`,
      versionSnapshots: sql<number>`(select count(*)::int from ${missionVersions} where ${missionVersions.snapshot}::text like ${`%${asset.url}%`} and ${missionVersions.status} in ('in_review','approved','published'))`,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId));
  if (
    (references?.missionCovers ?? 0) +
      (references?.worldCovers ?? 0) +
      (references?.resourceMedia ?? 0) +
      (references?.questionPayloads ?? 0) +
      (references?.versionSnapshots ?? 0) >
    0
  ) {
    throw new Error(
      "Media đang được dùng trong nhiệm vụ, thế giới hoặc tài nguyên; hãy thay thế trước khi xóa",
    );
  }
  await deleteStoredMedia(asset.storageProvider, asset.storageKey, asset.storageMetadata);
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
