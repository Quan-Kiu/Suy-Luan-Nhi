// @vitest-environment node

import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import {
  auditLogs,
  missionVersions,
  missionWorlds,
  missions,
  skills,
  user,
  worldAgeGroups,
} from "@/db/schema";
import { createWorld, listAdminWorlds, updateWorld } from "@/modules/admin/operations";
import { publishMissionVersion } from "@/modules/admin/mission-admin";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("mission publication visibility PostgreSQL integration", () => {
  const actorId = randomUUID();
  const skillId = randomUUID();
  const missionId = randomUUID();
  const versionId = randomUUID();
  const questionId = randomUUID();
  const slugSuffix = randomUUID().slice(0, 8);
  let worldId = "";

  beforeAll(async () => {
    await db.insert(user).values({
      id: actorId,
      name: "Publication Test Admin",
      email: `publication-${actorId}@test.local`,
      emailVerified: true,
      role: "content_admin",
    });
    await db.insert(skills).values({
      id: skillId,
      slug: `publication-skill-${slugSuffix}`,
      title: "Publication skill",
      description: "Publication visibility integration skill",
      category: "logic",
    });
    const world = await createWorld(actorId, {
      slug: `publication-world-${slugSuffix}`,
      title: "Publication world",
      subtitle: "Visible for selected ages",
      description: "World used to verify publication audience invariants.",
      sortOrder: 999,
      themeColor: "green",
      coverUrl: "/assets/cards/world-card-detective-rules.png",
      ageGroups: ["6-8"],
    });
    worldId = world.id;
    await updateWorld(actorId, worldId, {
      title: world.title,
      subtitle: world.subtitle,
      description: world.description,
      sortOrder: world.sortOrder,
      themeColor: world.themeColor,
      coverUrl: world.coverUrl,
      status: "published",
      ageGroups: ["6-8"],
    });

    await db.insert(missions).values({
      id: missionId,
      worldId,
      slug: `publication-mission-${slugSuffix}`,
      title: "Publication mission",
      subtitle: "Audience check",
      shortDescription: "Checks publication visibility.",
      storyIntro: "A short story for the publication test.",
      estimatedMinutes: 5,
      primarySkillId: skillId,
      coverUrl: "/assets/cards/world-card-detective-rules.png",
      status: "approved",
      difficulty: 1,
      createdBy: actorId,
      updatedBy: actorId,
    });
    await db.insert(missionVersions).values({
      id: versionId,
      missionId,
      versionNumber: 1,
      status: "approved",
      createdBy: actorId,
      snapshot: {
        id: missionId,
        worldId,
        worldSlug: world.slug,
        slug: `publication-mission-${slugSuffix}`,
        title: "Publication mission",
        subtitle: "Audience check",
        shortDescription: "Checks publication visibility.",
        storyIntro: "A short story for the publication test.",
        estimatedMinutes: 5,
        ageGroups: ["6-8", "9-10"],
        primarySkill: `publication-skill-${slugSuffix}`,
        secondarySkills: [],
        coverUrl: "/assets/cards/world-card-detective-rules.png",
        difficulty: 1,
        questions: [
          {
            id: questionId,
            order: 1,
            type: "single_choice",
            prompt: "Đâu là đáp án đúng?",
            instruction: "Hãy chọn một đáp án.",
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
        safetyChecklist: { childSafe: true },
      },
    });
  });

  afterAll(async () => {
    await db
      .delete(auditLogs)
      .where(
        and(
          eq(auditLogs.actorId, actorId),
          inArray(auditLogs.resourceType, ["mission_world", "mission_version"]),
        ),
      );
    await db.delete(missions).where(eq(missions.id, missionId));
    if (worldId) await db.delete(missionWorlds).where(eq(missionWorlds.id, worldId));
    await db.delete(skills).where(eq(skills.id, skillId));
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("persists world age groups and preserves them during partial updates", async () => {
    await updateWorld(actorId, worldId, { title: "Publication world updated" });
    const worlds = await listAdminWorlds();
    expect(worlds.find((world) => world.id === worldId)).toMatchObject({
      title: "Publication world updated",
      ageGroups: ["6-8"],
    });
  });

  it("rejects publication when the world does not cover every mission age group", async () => {
    const result = await publishMissionVersion(missionId, versionId, actorId);
    expect(result).toEqual({ error: "world_age_groups_incomplete", missingAgeGroups: ["9-10"] });
    const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
    expect(mission?.status).toBe("approved");
  });

  it("publishes after the world audience is corrected", async () => {
    const world = await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.id, worldId) });
    expect(world).toBeTruthy();
    await updateWorld(actorId, worldId, {
      title: world!.title,
      subtitle: world!.subtitle,
      description: world!.description,
      sortOrder: world!.sortOrder,
      themeColor: world!.themeColor,
      coverUrl: world!.coverUrl,
      status: "published",
      ageGroups: ["6-8", "9-10"],
    });
    const groups = await db
      .select({ ageGroup: worldAgeGroups.ageGroup })
      .from(worldAgeGroups)
      .where(eq(worldAgeGroups.worldId, worldId));
    expect(groups.map((row) => row.ageGroup).sort()).toEqual(["6-8", "9-10"]);

    const result = await publishMissionVersion(missionId, versionId, actorId);
    expect("version" in result).toBe(true);
    const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
    expect(mission).toMatchObject({ status: "published", publishedVersionId: versionId });
  });

  it("prevents a published world from hiding an existing mission audience", async () => {
    await expect(updateWorld(actorId, worldId, { ageGroups: ["6-8"] })).rejects.toMatchObject({
      name: "WorldAudienceConflictError",
      missingAgeGroups: ["9-10"],
    });
    const groups = await db
      .select({ ageGroup: worldAgeGroups.ageGroup })
      .from(worldAgeGroups)
      .where(eq(worldAgeGroups.worldId, worldId));
    expect(groups.map((row) => row.ageGroup).sort()).toEqual(["6-8", "9-10"]);
  });

  it("prevents hiding a world while it still contains published missions", async () => {
    await expect(updateWorld(actorId, worldId, { status: "archived" })).rejects.toMatchObject({
      name: "WorldPublishedMissionConflictError",
      publishedMissionCount: 1,
    });
    const world = await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.id, worldId) });
    expect(world?.status).toBe("published");
  });
});
