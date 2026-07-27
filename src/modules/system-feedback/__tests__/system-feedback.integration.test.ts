// @vitest-environment node

import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import { auditLogs, systemFeedback, user } from "@/db/schema";
import { automaticFeedbackReopenWindowMs } from "@/modules/system-feedback/automatic-feedback";
import {
  createOrAggregateAutomaticFeedback,
  listSystemFeedback,
} from "@/modules/system-feedback/system-feedback";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("automatic feedback PostgreSQL integration", () => {
  const actorId = randomUUID();
  const trackedFeedbackIds = new Set<string>();

  beforeAll(async () => {
    await db.insert(user).values({
      id: actorId,
      name: "Automatic Feedback Test Actor",
      email: `automatic-feedback-${actorId}@test.local`,
      emailVerified: true,
      role: "parent",
    });
  });

  afterAll(async () => {
    const ids = [...trackedFeedbackIds];
    if (ids.length) {
      await db.delete(auditLogs).where(inArray(auditLogs.resourceId, ids));
      await db.delete(systemFeedback).where(inArray(systemFeedback.id, ids));
    }
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("does not replace feedback deduplication with one audit row per occurrence", async () => {
    const fingerprint = randomUUID().replaceAll("-", "");
    const input = {
      fingerprint,
      userId: actorId,
      content: "Automatic feedback integration failure",
      pagePath: `/integration/automatic-feedback/${fingerprint}`,
      pageTitle: "Automatic feedback integration",
      context: { reportKind: "automatic_error", source: "api_failure" },
    };

    const created = await createOrAggregateAutomaticFeedback(input);
    trackedFeedbackIds.add(created.id);
    const duplicate = await createOrAggregateAutomaticFeedback({
      ...input,
      context: { ...input.context, requestId: "volatile-request-id" },
    });

    expect(duplicate).toMatchObject({ id: created.id, duplicate: true, reopened: false });
    expect(duplicate.item?.occurrenceCount).toBe(2);

    const beforeReopen = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, created.id));
    expect(beforeReopen.map((entry) => entry.action)).toEqual(["system_feedback.automatic_created"]);

    await db
      .update(systemFeedback)
      .set({
        status: "resolved",
        lastSeenAt: new Date(Date.now() - automaticFeedbackReopenWindowMs - 1_000),
      })
      .where(eq(systemFeedback.id, created.id));

    const reopened = await createOrAggregateAutomaticFeedback(input);
    expect(reopened).toMatchObject({ id: created.id, duplicate: true, reopened: true });
    expect(reopened.item?.status).toBe("new");

    const afterReopen = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, created.id));
    expect(new Set(afterReopen.map((entry) => entry.action))).toEqual(
      new Set(["system_feedback.automatic_created", "system_feedback.automatic_reopened"]),
    );
  });

  it("orders recurring faults by their latest occurrence instead of original creation time", async () => {
    const recentSeenId = randomUUID();
    const oldSeenId = randomUUID();
    trackedFeedbackIds.add(recentSeenId);
    trackedFeedbackIds.add(oldSeenId);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1_000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1_000);

    await db.insert(systemFeedback).values([
      {
        id: recentSeenId,
        content: "Older fault seen again recently",
        pagePath: `/integration/feedback-order/${recentSeenId}`,
        status: "in_progress",
        createdAt: twoDaysAgo,
        firstSeenAt: twoDaysAgo,
        lastSeenAt: now,
      },
      {
        id: oldSeenId,
        content: "Newer fault with an older last occurrence",
        pagePath: `/integration/feedback-order/${oldSeenId}`,
        status: "in_progress",
        createdAt: now,
        firstSeenAt: oneDayAgo,
        lastSeenAt: oneDayAgo,
      },
    ]);

    const result = await listSystemFeedback({ status: "in_progress", pageSize: 100 });
    const recentSeenIndex = result.items.findIndex((item) => item.id === recentSeenId);
    const oldSeenIndex = result.items.findIndex((item) => item.id === oldSeenId);

    expect(recentSeenIndex).toBeGreaterThanOrEqual(0);
    expect(oldSeenIndex).toBeGreaterThanOrEqual(0);
    expect(recentSeenIndex).toBeLessThan(oldSeenIndex);
  });
});
