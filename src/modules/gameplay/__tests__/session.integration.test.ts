// @vitest-environment node

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import {
  activitySummaries,
  analyticsEvents,
  childProfiles,
  missionSessions,
  missions,
  notifications,
  parentProfiles,
  user,
} from "@/db/schema";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";
import { completeMission, getSessionView, startMission, submitAnswer } from "@/modules/gameplay/session";

const runDbTests = process.env.RUN_DB_TESTS === "true";
const suite = runDbTests ? describe : describe.skip;

suite("Mission Session PostgreSQL integration", () => {
  const userId = randomUUID();
  let childId = "";
  let parentId = "";

  beforeAll(async () => {
    await db.insert(user).values({
      id: userId,
      name: "Integration Parent",
      email: `integration-${userId}@test.local`,
      emailVerified: true,
      role: "parent",
    });
    [parentId] = await db
      .insert(parentProfiles)
      .values({ userId, displayName: "Integration Parent" })
      .returning({ id: parentProfiles.id })
      .then((rows) => rows.map((row) => row.id));
    [childId] = await db
      .insert(childProfiles)
      .values({
        parentProfileId: parentId,
        displayName: "Test Child",
        ageGroup: "4-5",
        avatarUrl: "/assets/mascots/mascot-dog-bong-avatar.png",
      })
      .returning({ id: childProfiles.id })
      .then((rows) => rows.map((row) => row.id));
  });

  afterAll(async () => {
    await db.delete(analyticsEvents).where(eq(analyticsEvents.userId, userId));
    await db.delete(user).where(eq(user.id, userId));
    await pool.end();
  });

  it("prevents duplicate active sessions and awards completion exactly once", async () => {
    const mission = await db.query.missions.findFirst({ where: eq(missions.slug, "footprint-detective") });
    expect(mission).toBeTruthy();

    const firstStart = await startMission(userId, childId, mission!.id);
    const concurrentStart = await startMission(userId, childId, mission!.id);
    expect("error" in firstStart).toBe(false);
    expect("error" in concurrentStart).toBe(false);
    if ("error" in firstStart || "error" in concurrentStart) return;
    expect(firstStart.session.id).toBe(concurrentStart.session.id);

    const sessionId = firstStart.session.id;
    const version = await db.query.missionVersions.findFirst({
      where: (table, { eq: equal }) => equal(table.id, firstStart.session.missionVersionId),
    });
    expect(version).toBeTruthy();
    const snapshot = parseMissionSnapshot(version!.snapshot);

    for (const question of snapshot.questions) {
      const view = await getSessionView(userId, sessionId);
      expect("error" in view).toBe(false);
      if ("error" in view) return;
      expect(view.question.id).toBe(question.id);
      const key = randomUUID();
      const answer = await submitAnswer({
        userId,
        sessionId,
        questionId: question.id,
        submission: question.correctAnswer,
        responseTimeMs: 400,
        idempotencyKey: key,
      });
      expect("error" in answer).toBe(false);
      expect("correct" in answer).toBe(true);
      if ("error" in answer || !("correct" in answer)) return;
      expect(answer.correct).toBe(true);

      const duplicate = await submitAnswer({
        userId,
        sessionId,
        questionId: question.id,
        submission: question.correctAnswer,
        responseTimeMs: 400,
        idempotencyKey: key,
      });
      expect("error" in duplicate).toBe(false);
      expect("duplicate" in duplicate).toBe(true);
      expect("correct" in duplicate).toBe(true);
      if ("error" in duplicate || !("duplicate" in duplicate) || !("correct" in duplicate)) return;
      expect(duplicate.duplicate).toBe(true);
      expect(duplicate.correct).toBe(true);
    }

    const completion = await completeMission(userId, sessionId);
    const repeatedCompletion = await completeMission(userId, sessionId);
    expect("error" in completion).toBe(false);
    expect("error" in repeatedCompletion).toBe(false);

    const session = await db.query.missionSessions.findFirst({ where: eq(missionSessions.id, sessionId) });
    expect(session?.status).toBe("completed");
    const activity = await db.query.activitySummaries.findMany({
      where: eq(activitySummaries.childProfileId, childId),
    });
    expect(activity.reduce((sum, row) => sum + row.missionsCompleted, 0)).toBe(1);
    const parentNotifications = await db.query.notifications.findMany({
      where: and(eq(notifications.parentProfileId, parentId), eq(notifications.type, "mission_completed")),
    });
    expect(parentNotifications).toHaveLength(1);
  });
});
