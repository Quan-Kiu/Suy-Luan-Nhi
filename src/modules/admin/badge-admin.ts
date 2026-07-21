import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLogs, badges, childBadges, mediaAssets, missions, skills } from "@/db/schema";

export const createBadgeSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Mã huy hiệu cần ít nhất 2 ký tự")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Mã chỉ gồm chữ thường, số và dấu gạch ngang"),
  name: z.string().trim().min(2, "Tên huy hiệu cần ít nhất 2 ký tự").max(80),
  description: z.string().trim().min(8, "Mô tả cần ít nhất 8 ký tự").max(300),
  iconUrl: z.string().trim().min(1, "Hãy chọn ảnh huy hiệu"),
  skillId: z.string().uuid().nullable(),
});

export const updateBadgeSchema = createBadgeSchema.omit({ slug: true }).extend({ active: z.boolean() });
export type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
export type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;

async function resolveBadgeIcon(iconUrl: string) {
  if (iconUrl.startsWith("/assets/")) return { ok: true, iconAssetId: null } as const;
  const asset = await db.query.mediaAssets.findFirst({
    where: eq(mediaAssets.url, iconUrl),
  });
  if (!asset || asset.deletedAt) return { ok: false, error: "icon_not_registered" } as const;
  if (asset.type !== "image") return { ok: false, error: "icon_not_image" } as const;
  return { ok: true, iconAssetId: asset.id } as const;
}

export async function listBadges() {
  return db
    .select({
      id: badges.id,
      slug: badges.slug,
      name: badges.name,
      description: badges.description,
      iconAssetId: badges.iconAssetId,
      iconUrl: badges.iconUrl,
      skillId: badges.skillId,
      skillTitle: skills.title,
      active: badges.active,
      missionCount: sql<number>`(select count(*)::int from ${missions} where ${missions.rewardBadgeId} = ${badges.id})`,
      earnedCount: sql<number>`(select count(*)::int from ${childBadges} where ${childBadges.badgeId} = ${badges.id})`,
    })
    .from(badges)
    .leftJoin(skills, eq(badges.skillId, skills.id))
    .orderBy(asc(badges.name));
}

export async function createBadge(actorId: string, input: CreateBadgeInput) {
  const existing = await db.query.badges.findFirst({ where: eq(badges.slug, input.slug) });
  if (existing) return { error: "slug_conflict" } as const;
  const icon = await resolveBadgeIcon(input.iconUrl);
  if (!icon.ok) return { error: icon.error } as const;
  const [created] = await db
    .insert(badges)
    .values({
      ...input,
      iconAssetId: icon.iconAssetId,
      unlockRule: { type: "mission_completion" },
      active: true,
    })
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "badge.created",
    resourceType: "badge",
    resourceId: created.id,
    afterState: created,
  });
  return { badge: created } as const;
}

export async function updateBadge(actorId: string, badgeId: string, input: UpdateBadgeInput) {
  const current = await db.query.badges.findFirst({ where: eq(badges.id, badgeId) });
  if (!current) return { error: "not_found" } as const;
  const icon = await resolveBadgeIcon(input.iconUrl);
  if (!icon.ok) return { error: icon.error } as const;
  const [updated] = await db
    .update(badges)
    .set({
      name: input.name,
      description: input.description,
      iconUrl: input.iconUrl,
      iconAssetId: icon.iconAssetId,
      skillId: input.skillId,
      active: input.active,
    })
    .where(eq(badges.id, badgeId))
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "badge.updated",
    resourceType: "badge",
    resourceId: badgeId,
    beforeState: current,
    afterState: updated,
  });
  return { badge: updated } as const;
}
