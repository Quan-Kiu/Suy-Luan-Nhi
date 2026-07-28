// @vitest-environment node

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import { auditLogs, childProfiles, parentProfiles, parentResources, user } from "@/db/schema";
import {
  archiveAdminResource,
  createAdminResource,
  getAdminResource,
  ResourceRevisionConflictError,
  updateAdminResource,
  type AdminResourceInput,
} from "@/modules/admin/resource-admin";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("production hardening PostgreSQL integration", () => {
  const actorId = randomUUID();
  const parentUserId = randomUUID();
  const parentProfileId = randomUUID();
  const childProfileId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  let resourceId = "";

  const resourceInput: AdminResourceInput = {
    slug: `resource-concurrency-${suffix}`,
    title: "Bài viết kiểm tra đồng thời",
    excerpt: "Tài nguyên dùng để kiểm tra cơ chế chống ghi đè dữ liệu cũ.",
    content: "Nội dung đủ dài để xác nhận hai quản trị viên không thể âm thầm ghi đè thay đổi của nhau.",
    resourceType: "article",
    category: "thinking",
    ageGroups: ["6-8"],
    coverUrl: "/assets/demo.png",
    mediaUrl: null,
    sortOrder: 999,
    status: "draft",
  };

  beforeAll(async () => {
    await db.insert(user).values([
      {
        id: actorId,
        name: "Resource Concurrency Admin",
        email: `resource-admin-${suffix}@test.local`,
        emailVerified: true,
        role: "content_admin",
      },
      {
        id: parentUserId,
        name: "Profile Constraint Parent",
        email: `profile-parent-${suffix}@test.local`,
        emailVerified: true,
        role: "parent",
      },
    ]);
    await db.insert(parentProfiles).values({
      id: parentProfileId,
      userId: parentUserId,
      displayName: "Phụ huynh kiểm thử",
    });
    const resource = await createAdminResource(resourceInput, actorId);
    resourceId = resource.id;
  });

  afterAll(async () => {
    if (childProfileId) await db.delete(childProfiles).where(eq(childProfiles.id, childProfileId));
    if (resourceId) {
      await db.delete(auditLogs).where(eq(auditLogs.resourceId, resourceId));
      await db.delete(parentResources).where(eq(parentResources.id, resourceId));
    }
    await db.delete(parentProfiles).where(eq(parentProfiles.id, parentProfileId));
    await db.delete(user).where(eq(user.id, parentUserId));
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("enforces the two-character child display-name invariant in PostgreSQL", async () => {
    await expect(
      db.insert(childProfiles).values({
        parentProfileId,
        displayName: "Q",
        ageGroup: "6-8",
        avatarUrl: "/assets/avatar.png",
      }),
    ).rejects.toThrow();

    await db.insert(childProfiles).values({
      id: childProfileId,
      parentProfileId,
      displayName: "An",
      ageGroup: "6-8",
      avatarUrl: "/assets/avatar.png",
    });
    const child = await db.query.childProfiles.findFirst({ where: eq(childProfiles.id, childProfileId) });
    expect(child?.displayName).toBe("An");
  });

  it("rejects stale resource updates and archive operations", async () => {
    const initial = await getAdminResource(resourceId);
    expect(initial?.revision).toBe(1);

    const updated = await updateAdminResource(
      resourceId,
      { ...resourceInput, title: "Nội dung mới từ quản trị viên thứ nhất" },
      actorId,
      initial!.revision,
    );
    expect(updated?.revision).toBe(2);

    await expect(
      updateAdminResource(
        resourceId,
        { ...resourceInput, title: "Dữ liệu cũ từ quản trị viên thứ hai" },
        actorId,
        initial!.revision,
      ),
    ).rejects.toBeInstanceOf(ResourceRevisionConflictError);
    await expect(archiveAdminResource(resourceId, actorId, initial!.revision)).rejects.toBeInstanceOf(
      ResourceRevisionConflictError,
    );

    const latest = await getAdminResource(resourceId);
    expect(latest?.title).toBe("Nội dung mới từ quản trị viên thứ nhất");
    expect(latest?.status).toBe("draft");
    expect(latest?.revision).toBe(2);
  });
});
