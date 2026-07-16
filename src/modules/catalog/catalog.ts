import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  badges,
  missionAgeGroups,
  missionSessions,
  missionVersions,
  missionWorlds,
  missions,
  skills,
  worldAgeGroups,
} from "@/db/schema";

export async function getMissionMap(child: { id: string; ageGroup: "2-3" | "4-5" | "6-8" }) {
  const worlds = await db
    .select({
      id: missionWorlds.id,
      slug: missionWorlds.slug,
      title: missionWorlds.title,
      subtitle: missionWorlds.subtitle,
      description: missionWorlds.description,
      order: missionWorlds.sortOrder,
      theme: missionWorlds.themeColor,
      coverUrl: missionWorlds.coverUrl,
    })
    .from(missionWorlds)
    .innerJoin(worldAgeGroups, eq(worldAgeGroups.worldId, missionWorlds.id))
    .where(and(eq(missionWorlds.status, "published"), eq(worldAgeGroups.ageGroup, child.ageGroup)))
    .orderBy(asc(missionWorlds.sortOrder));

  const missionRows = await db
    .select({
      id: missions.id,
      slug: missions.slug,
      worldId: missions.worldId,
      title: missions.title,
      subtitle: missions.subtitle,
      shortDescription: missions.shortDescription,
      coverUrl: missions.coverUrl,
      difficulty: missions.difficulty,
      estimatedMinutes: missions.estimatedMinutes,
      publishedVersionId: missions.publishedVersionId,
      createdAt: missions.createdAt,
    })
    .from(missions)
    .innerJoin(missionAgeGroups, eq(missionAgeGroups.missionId, missions.id))
    .where(and(eq(missions.status, "published"), eq(missionAgeGroups.ageGroup, child.ageGroup)))
    .orderBy(asc(missions.createdAt));

  const missionIds = missionRows.map((mission) => mission.id);
  const completedRows = missionIds.length
    ? await db
        .select({ missionId: missionSessions.missionId })
        .from(missionSessions)
        .where(
          and(
            eq(missionSessions.childProfileId, child.id),
            eq(missionSessions.status, "completed"),
            inArray(missionSessions.missionId, missionIds),
          ),
        )
    : [];
  const completed = new Set(completedRows.map((row) => row.missionId));

  const worldsWithMissions = worlds.map((world, worldIndex) => {
    const worldMissions = missionRows.filter((mission) => mission.worldId === world.id);
    const previousWorld = worlds[worldIndex - 1];
    const previousWorldCompleted =
      !previousWorld ||
      missionRows.some((mission) => mission.worldId === previousWorld.id && completed.has(mission.id));
    const worldUnlocked = worldIndex === 0 || previousWorldCompleted;
    const mappedMissions = worldMissions.map((mission, missionIndex) => {
      const previousMission = worldMissions[missionIndex - 1];
      const unlocked = worldUnlocked && (missionIndex === 0 || completed.has(previousMission.id));
      return {
        ...mission,
        completed: completed.has(mission.id),
        unlocked,
        recommended:
          unlocked &&
          !completed.has(mission.id) &&
          !worldMissions.slice(0, missionIndex).some((item) => !completed.has(item.id)),
      };
    });
    return {
      ...world,
      unlocked: worldUnlocked,
      completed: worldMissions.length > 0 && worldMissions.every((mission) => completed.has(mission.id)),
      missions: mappedMissions,
    };
  });

  return { child, worlds: worldsWithMissions };
}

export async function getPublishedMission(identifier: string) {
  const rows = await db
    .select({
      mission: missions,
      world: missionWorlds,
      version: missionVersions,
      primarySkill: skills,
      badge: badges,
    })
    .from(missions)
    .innerJoin(missionWorlds, eq(missions.worldId, missionWorlds.id))
    .innerJoin(missionVersions, eq(missions.publishedVersionId, missionVersions.id))
    .innerJoin(skills, eq(missions.primarySkillId, skills.id))
    .leftJoin(badges, eq(missions.rewardBadgeId, badges.id))
    .where(
      and(
        eq(missions.status, "published"),
        eq(missionVersions.status, "published"),
        identifier.includes("-") && identifier.length === 36
          ? eq(missions.id, identifier)
          : eq(missions.slug, identifier),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listPublishedWorlds() {
  return db
    .select()
    .from(missionWorlds)
    .where(eq(missionWorlds.status, "published"))
    .orderBy(asc(missionWorlds.sortOrder));
}

export async function listWorldMissions(worldId: string, ageGroup?: "2-3" | "4-5" | "6-8") {
  const conditions = [eq(missions.worldId, worldId), eq(missions.status, "published")];
  if (!ageGroup)
    return db
      .select()
      .from(missions)
      .where(and(...conditions))
      .orderBy(asc(missions.createdAt));
  return db
    .select({ mission: missions })
    .from(missions)
    .innerJoin(missionAgeGroups, eq(missionAgeGroups.missionId, missions.id))
    .where(and(...conditions, eq(missionAgeGroups.ageGroup, ageGroup)))
    .orderBy(asc(missions.createdAt))
    .then((rows) => rows.map((row) => row.mission));
}
