import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { auditLogs, mediaAssets, systemFeedback, systemFeedbackAttachments, user } from "@/db/schema";
import type { SystemFeedbackStatus } from "@/domain/system-feedback";
import { MediaValidationError } from "@/modules/media/storage/errors";
import { automaticFeedbackReopenWindowMs } from "@/modules/system-feedback/automatic-feedback";
import { deleteMedia, uploadMedia } from "@/modules/media/media";

export type SystemFeedbackListFilters = {
  id?: string;
  status?: SystemFeedbackStatus;
  page?: number;
  pageSize?: number;
};

export async function listSystemFeedback(filters: SystemFeedbackListFilters = {}) {
  const pageSize = Math.min(100, Math.max(10, Math.trunc(filters.pageSize ?? 50)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const conditions = [];
  if (filters.id) conditions.push(eq(systemFeedback.id, filters.id));
  if (filters.status) conditions.push(eq(systemFeedback.status, filters.status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [baseItems, countRows] = await Promise.all([
    db
      .select({
        id: systemFeedback.id,
        content: systemFeedback.content,
        pagePath: systemFeedback.pagePath,
        pageTitle: systemFeedback.pageTitle,
        context: systemFeedback.context,
        fingerprint: systemFeedback.fingerprint,
        occurrenceCount: systemFeedback.occurrenceCount,
        firstSeenAt: systemFeedback.firstSeenAt,
        lastSeenAt: systemFeedback.lastSeenAt,
        status: systemFeedback.status,
        adminNote: systemFeedback.adminNote,
        handledBy: systemFeedback.handledBy,
        handledAt: systemFeedback.handledAt,
        createdAt: systemFeedback.createdAt,
        updatedAt: systemFeedback.updatedAt,
        userId: systemFeedback.userId,
        userName: user.name,
        userEmail: user.email,
      })
      .from(systemFeedback)
      .leftJoin(user, eq(systemFeedback.userId, user.id))
      .where(where)
      .orderBy(desc(systemFeedback.lastSeenAt), desc(systemFeedback.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(systemFeedback)
      .where(where),
  ]);

  const ids = baseItems.map((item) => item.id);
  const attachmentRows = ids.length
    ? await db
        .select({
          feedbackId: systemFeedbackAttachments.feedbackId,
          sortOrder: systemFeedbackAttachments.sortOrder,
          id: mediaAssets.id,
          url: mediaAssets.url,
          altText: mediaAssets.altText,
          fileName: mediaAssets.fileName,
          mimeType: mediaAssets.mimeType,
          size: mediaAssets.size,
        })
        .from(systemFeedbackAttachments)
        .innerJoin(mediaAssets, eq(systemFeedbackAttachments.mediaAssetId, mediaAssets.id))
        .where(inArray(systemFeedbackAttachments.feedbackId, ids))
        .orderBy(asc(systemFeedbackAttachments.sortOrder))
    : [];

  const attachmentsByFeedback = new Map<string, typeof attachmentRows>();
  for (const attachment of attachmentRows) {
    const list = attachmentsByFeedback.get(attachment.feedbackId) ?? [];
    list.push(attachment);
    attachmentsByFeedback.set(attachment.feedbackId, list);
  }

  const total = countRows[0]?.count ?? 0;
  return {
    items: baseItems.map((item) => ({
      ...item,
      userName: item.userName ?? (item.userId ? "Tài khoản đã xóa" : "Khách chưa đăng nhập"),
      userEmail: item.userEmail ?? (item.userId ? "Không còn thông tin" : "Không cung cấp email"),
      attachments: attachmentsByFeedback.get(item.id) ?? [],
    })),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createOrAggregateAutomaticFeedback(input: {
  fingerprint: string;
  userId: string;
  content: string;
  pagePath: string;
  pageTitle?: string;
  context: Record<string, unknown>;
}) {
  const outcome = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`sln:automatic-feedback:${input.fingerprint}`}))`,
    );
    const current = await tx.query.systemFeedback.findFirst({
      where: eq(systemFeedback.fingerprint, input.fingerprint),
    });
    const now = new Date();
    if (!current) {
      const [created] = await tx
        .insert(systemFeedback)
        .values({
          userId: input.userId,
          content: input.content.trim(),
          pagePath: input.pagePath,
          pageTitle: input.pageTitle?.trim() || null,
          context: input.context,
          fingerprint: input.fingerprint,
          occurrenceCount: 1,
          firstSeenAt: now,
          lastSeenAt: now,
        })
        .returning({ id: systemFeedback.id });
      await tx.insert(auditLogs).values({
        actorId: input.userId,
        action: "system_feedback.automatic_created",
        resourceType: "system_feedback",
        resourceId: created.id,
        metadata: { fingerprint: input.fingerprint.slice(0, 12), occurrenceCount: 1 },
      });
      return { id: created.id, duplicate: false, reopened: false };
    }

    const finalStatus = current.status === "resolved" || current.status === "dismissed";
    const reopened =
      finalStatus && now.getTime() - current.lastSeenAt.getTime() >= automaticFeedbackReopenWindowMs;
    const [updated] = await tx
      .update(systemFeedback)
      .set({
        userId: input.userId,
        content: input.content.trim(),
        pagePath: input.pagePath,
        pageTitle: input.pageTitle?.trim() || null,
        context: input.context,
        occurrenceCount: sql`${systemFeedback.occurrenceCount} + 1`,
        lastSeenAt: now,
        updatedAt: now,
        status: reopened ? "new" : current.status,
        handledBy: reopened ? null : current.handledBy,
        handledAt: reopened ? null : current.handledAt,
      })
      .where(eq(systemFeedback.id, current.id))
      .returning({ id: systemFeedback.id, occurrenceCount: systemFeedback.occurrenceCount });
    if (reopened) {
      await tx.insert(auditLogs).values({
        actorId: input.userId,
        action: "system_feedback.automatic_reopened",
        resourceType: "system_feedback",
        resourceId: current.id,
        metadata: {
          fingerprint: input.fingerprint.slice(0, 12),
          occurrenceCount: updated.occurrenceCount,
        },
      });
    }
    return { id: current.id, duplicate: true, reopened };
  });

  const result = await listSystemFeedback({ id: outcome.id, pageSize: 10 });
  return { ...outcome, item: result.items[0] };
}

export async function createSystemFeedback(input: {
  userId: string | null;
  content: string;
  pagePath: string;
  pageTitle?: string;
  context: Record<string, unknown>;
  images: File[];
}) {
  const uploaded: Awaited<ReturnType<typeof uploadMedia>>[] = [];
  try {
    for (const [index, image] of input.images.entries()) {
      const asset = await uploadMedia(
        image,
        `Ảnh đính kèm góp ý ${index + 1}`,
        "feedback-attachment",
        input.userId,
      );
      uploaded.push(asset);
      if (asset.type !== "image") {
        throw new MediaValidationError("Phần đính kèm góp ý chỉ nhận tệp hình ảnh");
      }
    }

    const createdId = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(systemFeedback)
        .values({
          userId: input.userId,
          content: input.content.trim(),
          pagePath: input.pagePath,
          pageTitle: input.pageTitle?.trim() || null,
          context: input.context,
        })
        .returning({ id: systemFeedback.id });
      if (uploaded.length) {
        await tx.insert(systemFeedbackAttachments).values(
          uploaded.map((asset, index) => ({
            feedbackId: created.id,
            mediaAssetId: asset.id,
            sortOrder: index,
          })),
        );
      }
      await tx.insert(auditLogs).values({
        actorId: input.userId,
        action: "system_feedback.created",
        resourceType: "system_feedback",
        resourceId: created.id,
        metadata: { attachmentCount: uploaded.length, contentLength: input.content.trim().length },
      });
      return created.id;
    });

    const result = await listSystemFeedback({ id: createdId, pageSize: 10 });
    return result.items[0];
  } catch (error) {
    await Promise.allSettled(uploaded.map((asset) => deleteMedia(asset.id, input.userId)));
    throw error;
  }
}

export async function updateSystemFeedback(
  feedbackId: string,
  actorId: string,
  input: { status: SystemFeedbackStatus; adminNote?: string },
) {
  const current = await db.query.systemFeedback.findFirst({ where: eq(systemFeedback.id, feedbackId) });
  if (!current) return null;
  const final = input.status === "resolved" || input.status === "dismissed";
  const active = input.status === "in_progress" || final;
  const [updated] = await db
    .update(systemFeedback)
    .set({
      status: input.status,
      adminNote: input.adminNote?.trim() || null,
      handledBy: active ? actorId : null,
      handledAt: final ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(systemFeedback.id, feedbackId))
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "system_feedback.updated",
    resourceType: "system_feedback",
    resourceId: feedbackId,
    beforeState: { status: current.status, adminNote: current.adminNote },
    afterState: { status: updated.status, adminNote: updated.adminNote },
  });
  const result = await listSystemFeedback({ id: feedbackId, pageSize: 10 });
  return result.items[0] ?? null;
}
