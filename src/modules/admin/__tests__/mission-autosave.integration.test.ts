// @vitest-environment node

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import { auditLogs, missionWorlds, missions, reviewHistories, skills, user } from "@/db/schema";
import {
  autosaveAdminMission,
  createAdminMission,
  getAdminMission,
  MissionDraftConflictError,
} from "@/modules/admin/mission-admin";
import { safetyKeys, type AdminMissionDraft } from "@/modules/admin/schemas";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("mission draft autosave PostgreSQL integration", () => {
  const actorId = randomUUID();
  const skillId = randomUUID();
  const worldId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  let missionId = "";

  const draft: AdminMissionDraft = {
    slug: `autosave-mission-${suffix}`,
    worldId,
    title: "Nhiệm vụ autosave",
    subtitle: "Kiểm tra tự động lưu",
    shortDescription: "Nhiệm vụ dùng để kiểm tra tự động lưu bản nháp.",
    storyIntro: "Một câu chuyện đủ dài để kiểm tra việc tự động lưu nhiệm vụ an toàn.",
    estimatedMinutes: 5,
    primarySkillId: skillId,
    secondarySkillIds: [],
    rewardBadgeId: null,
    coverUrl: "/assets/demo.png",
    ageGroups: ["6-8"],
    difficulty: 1,
    allowReplay: true,
    randomizeAnswers: false,
    questions: [
      {
        type: "single_choice",
        order: 1,
        prompt: "Đâu là đáp án đúng?",
        instruction: "Hãy quan sát kỹ rồi chọn.",
        payload: {
          options: [
            { id: "a", label: "Đáp án A" },
            { id: "b", label: "Đáp án B" },
          ],
        },
        correctAnswer: "a",
        difficulty: 1,
        feedbackCorrect: "Bé làm đúng rồi!",
        feedbackIncorrect: "Hãy thử lại nhé!",
        hints: [{ level: 1, text: "Quan sát hai lựa chọn." }],
      },
    ],
    safety: Object.fromEntries(safetyKeys.map((key) => [key, true])) as AdminMissionDraft["safety"],
  };

  beforeAll(async () => {
    await db.insert(user).values({
      id: actorId,
      name: "Autosave Test Admin",
      email: `autosave-${actorId}@test.local`,
      emailVerified: true,
      role: "content_admin",
    });
    await db.insert(skills).values({
      id: skillId,
      slug: `autosave-skill-${suffix}`,
      title: "Autosave skill",
      description: "Skill used by the autosave integration test.",
      category: "logic",
    });
    await db.insert(missionWorlds).values({
      id: worldId,
      slug: `autosave-world-${suffix}`,
      title: "Autosave world",
      subtitle: "Autosave test world",
      description: "World used to verify mission draft autosave behavior.",
      sortOrder: 999,
      themeColor: "green",
      coverUrl: "/assets/demo.png",
    });
    const mission = await createAdminMission(draft, actorId);
    missionId = mission.id;
  });

  afterAll(async () => {
    if (missionId) {
      await db.delete(auditLogs).where(eq(auditLogs.resourceId, missionId));
      await db.delete(missions).where(eq(missions.id, missionId));
    }
    await db.delete(missionWorlds).where(eq(missionWorlds.id, worldId));
    await db.delete(skills).where(eq(skills.id, skillId));
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("updates the draft without adding review or audit history", async () => {
    const before = await getAdminMission(missionId);
    expect(before).toBeTruthy();
    const reviewCountBefore = await db
      .select({ id: reviewHistories.id })
      .from(reviewHistories)
      .where(eq(reviewHistories.missionId, missionId));
    const auditCountBefore = await db
      .select({ id: auditLogs.id })
      .from(auditLogs)
      .where(eq(auditLogs.resourceId, missionId));

    const updated = await autosaveAdminMission(
      missionId,
      { ...before!.draft, title: "Nhiệm vụ đã tự động lưu" },
      actorId,
      before!.mission.currentDraftVersion,
    );

    expect(updated?.title).toBe("Nhiệm vụ đã tự động lưu");
    const after = await getAdminMission(missionId);
    expect(after?.draft.title).toBe("Nhiệm vụ đã tự động lưu");
    expect(
      await db
        .select({ id: reviewHistories.id })
        .from(reviewHistories)
        .where(eq(reviewHistories.missionId, missionId)),
    ).toHaveLength(reviewCountBefore.length);
    expect(
      await db.select({ id: auditLogs.id }).from(auditLogs).where(eq(auditLogs.resourceId, missionId)),
    ).toHaveLength(auditCountBefore.length);
  });

  it("rejects a stale editor version instead of overwriting newer content", async () => {
    const current = await getAdminMission(missionId);
    expect(current).toBeTruthy();
    const staleVersion = current!.mission.currentDraftVersion;

    await autosaveAdminMission(
      missionId,
      { ...current!.draft, subtitle: "Nội dung mới từ tab thứ nhất" },
      actorId,
      staleVersion,
    );

    await expect(
      autosaveAdminMission(
        missionId,
        { ...current!.draft, subtitle: "Nội dung cũ từ tab thứ hai" },
        actorId,
        staleVersion,
      ),
    ).rejects.toBeInstanceOf(MissionDraftConflictError);

    const after = await getAdminMission(missionId);
    expect(after?.draft.subtitle).toBe("Nội dung mới từ tab thứ nhất");
  });
});
