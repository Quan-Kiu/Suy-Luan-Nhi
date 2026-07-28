import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLogs, parentResources } from "@/db/schema";
import { ageGroupCodes } from "@/domain/age-groups";
import {
  parentResourceCategories,
  parentResourceTypes,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";

const resourceStatuses = ["draft", "published", "archived"] as const;
export type AdminResourceRecord = Omit<typeof parentResources.$inferSelect, "status"> & {
  status: (typeof resourceStatuses)[number];
};

function normalizeResource(row: typeof parentResources.$inferSelect): AdminResourceRecord {
  if (!resourceStatuses.includes(row.status as (typeof resourceStatuses)[number])) {
    throw new Error(`Trạng thái tài nguyên không hợp lệ: ${row.status}`);
  }
  return { ...row, status: row.status as (typeof resourceStatuses)[number] };
}

const resourceUrlSchema = z.string().trim().url().or(z.string().trim().startsWith("/"));

export const adminResourceSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Mã đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang"),
    title: z.string().trim().min(5).max(180),
    excerpt: z.string().trim().min(10).max(500),
    content: z.string().trim().min(30).max(50_000),
    resourceType: z.enum(parentResourceTypes),
    category: z.enum(parentResourceCategories),
    ageGroups: z.array(z.enum(ageGroupCodes)).min(1),
    coverUrl: resourceUrlSchema,
    mediaUrl: z.union([resourceUrlSchema, z.literal(""), z.null()]).transform((value) => value || null),
    sortOrder: z.number().int().min(0).max(10_000),
    status: z.enum(resourceStatuses),
  })
  .superRefine((resource, context) => {
    if (resource.resourceType === "video" && !resource.mediaUrl) {
      context.addIssue({
        code: "custom",
        path: ["mediaUrl"],
        message: "Hãy tải lên tệp video trước khi lưu tài nguyên video",
      });
    }
  });

export type AdminResourceInput = z.infer<typeof adminResourceSchema>;
export type AdminResourceFilters = {
  search?: string;
  status?: string;
  resourceType?: ParentResourceType;
  category?: ParentResourceCategory;
  ageGroup?: (typeof ageGroupCodes)[number];
  page?: number;
  pageSize?: number;
};

export async function listAdminResources(filters: AdminResourceFilters = {}) {
  const conditions = [];
  if (resourceStatuses.includes(filters.status as (typeof resourceStatuses)[number])) {
    conditions.push(eq(parentResources.status, filters.status as (typeof resourceStatuses)[number]));
  }
  if (filters.resourceType) conditions.push(eq(parentResources.resourceType, filters.resourceType));
  if (filters.category) conditions.push(eq(parentResources.category, filters.category));
  if (filters.ageGroup)
    conditions.push(sql`${parentResources.ageGroups} @> ${JSON.stringify([filters.ageGroup])}::jsonb`);
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    conditions.push(
      sql`(${parentResources.title} ilike ${`%${search}%`} or ${parentResources.slug} ilike ${`%${search}%`})`,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = Math.min(50, Math.max(5, Math.trunc(filters.pageSize ?? 10)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const [items, countRows] = await Promise.all([
    db
      .select()
      .from(parentResources)
      .where(where)
      .orderBy(desc(parentResources.updatedAt), asc(parentResources.sortOrder))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(parentResources)
      .where(where),
  ]);
  const total = countRows[0]?.count ?? 0;
  return {
    items: items.map(normalizeResource),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getAdminResource(resourceId: string) {
  const resource = await db.query.parentResources.findFirst({ where: eq(parentResources.id, resourceId) });
  return resource ? normalizeResource(resource) : null;
}

export class ResourceRevisionConflictError extends Error {
  readonly currentRevision: number;
  readonly currentUpdatedAt: Date;

  constructor(currentRevision: number, currentUpdatedAt: Date) {
    super("Parent resource was updated by another editor");
    this.name = "ResourceRevisionConflictError";
    this.currentRevision = currentRevision;
    this.currentUpdatedAt = currentUpdatedAt;
  }
}

function publishedAtForStatus(status: AdminResourceInput["status"], current?: Date | null) {
  if (status === "published") return current ?? new Date();
  return null;
}
export async function createAdminResource(input: AdminResourceInput, actorId: string) {
  const [resource] = await db
    .insert(parentResources)
    .values({
      ...input,
      publishedAt: publishedAtForStatus(input.status),
      createdBy: actorId,
      updatedAt: new Date(),
    })
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "parent_resource.created",
    resourceType: "parent_resource",
    resourceId: resource.id,
    afterState: resource,
  });
  return normalizeResource(resource);
}

async function latestResourceRevision(resourceId: string, fallback: AdminResourceRecord) {
  const [latest] = await db
    .select({ revision: parentResources.revision, updatedAt: parentResources.updatedAt })
    .from(parentResources)
    .where(eq(parentResources.id, resourceId))
    .limit(1);
  return latest ?? { revision: fallback.revision, updatedAt: fallback.updatedAt };
}

export async function updateAdminResource(
  resourceId: string,
  input: AdminResourceInput,
  actorId: string,
  expectedRevision: number,
) {
  const current = await getAdminResource(resourceId);
  if (!current) return null;
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new ResourceRevisionConflictError(current.revision, current.updatedAt);
  }
  const [resource] = await db
    .update(parentResources)
    .set({
      ...input,
      revision: sql`${parentResources.revision} + 1`,
      publishedAt: publishedAtForStatus(input.status, current.publishedAt),
      updatedAt: new Date(),
    })
    .where(and(eq(parentResources.id, resourceId), eq(parentResources.revision, expectedRevision)))
    .returning();
  if (!resource) {
    const latest = await latestResourceRevision(resourceId, current);
    throw new ResourceRevisionConflictError(latest.revision, latest.updatedAt);
  }
  await db.insert(auditLogs).values({
    actorId,
    action: "parent_resource.updated",
    resourceType: "parent_resource",
    resourceId,
    beforeState: current,
    afterState: resource,
  });
  return normalizeResource(resource);
}

export async function archiveAdminResource(resourceId: string, actorId: string, expectedRevision: number) {
  const current = await getAdminResource(resourceId);
  if (!current) return null;
  if (!Number.isInteger(expectedRevision) || expectedRevision < 1) {
    throw new ResourceRevisionConflictError(current.revision, current.updatedAt);
  }
  const [resource] = await db
    .update(parentResources)
    .set({
      status: "archived",
      revision: sql`${parentResources.revision} + 1`,
      publishedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(parentResources.id, resourceId), eq(parentResources.revision, expectedRevision)))
    .returning();
  if (!resource) {
    const latest = await latestResourceRevision(resourceId, current);
    throw new ResourceRevisionConflictError(latest.revision, latest.updatedAt);
  }
  await db.insert(auditLogs).values({
    actorId,
    action: "parent_resource.archived",
    resourceType: "parent_resource",
    resourceId,
    beforeState: current,
    afterState: resource,
  });
  return normalizeResource(resource);
}
