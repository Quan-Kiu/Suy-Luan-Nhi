import { and, asc, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import {
  badges,
  missionSessions,
  missionVersions,
  missionWorlds,
  missions,
  skills,
  worldAgeGroups,
} from "@/db/schema";
import type { AgeGroup } from "@/domain/age-groups";
import { cacheTags } from "@/lib/cache/tags";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";
import { resolveSkillLabels } from "@/modules/catalog/skill-labels";

type PublishedMissionRow = {
  mission: typeof missions.$inferSelect;
  version: typeof missionVersions.$inferSelect;
};

const publishedMissionCondition = and(
  isNotNull(missions.publishedVersionId),
  ne(missions.status, "archived"),
  eq(missionVersions.status, "published"),
);

function publishedListItem(row: PublishedMissionRow) {
  const snapshot = parseMissionSnapshot(row.version.snapshot);
  return {
    id: row.mission.id,
    slug: snapshot.slug,
    worldId: snapshot.worldId ?? row.mission.worldId,
    title: snapshot.title,
    subtitle: snapshot.subtitle,
    shortDescription: snapshot.shortDescription,
    coverUrl: snapshot.coverUrl,
    difficulty: snapshot.difficulty,
    estimatedMinutes: snapshot.estimatedMinutes,
    publishedVersionId: row.version.id,
    createdAt: row.mission.createdAt,
    ageGroups: snapshot.ageGroups,
  };
}

async function publishedMissionRows() {
  return db
    .select({ mission: missions, version: missionVersions })
    .from(missions)
    .innerJoin(missionVersions, eq(missions.publishedVersionId, missionVersions.id))
    .where(publishedMissionCondition)
    .orderBy(asc(missions.createdAt));
}

async function readMissionMap(child: { id: string; ageGroup: AgeGroup }) {
  const [worlds, rows] = await Promise.all([
    db
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
      .orderBy(asc(missionWorlds.sortOrder)),
    publishedMissionRows(),
  ]);
  const missionRows = rows
    .map(publishedListItem)
    .filter((mission) => mission.ageGroups.includes(child.ageGroup));

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
        unlockMessage: unlocked
          ? null
          : previousMission
            ? `Hoàn thành “${previousMission.title}” để mở nhiệm vụ này.`
            : previousWorld
              ? `Hoàn thành một nhiệm vụ trong “${previousWorld.title}” để mở thế giới này.`
              : "Nhiệm vụ này chưa được mở.",
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

export function getMissionMap(child: { id: string; ageGroup: AgeGroup }) {
  return unstable_cache(() => readMissionMap(child), ["child-mission-map", child.id, child.ageGroup], {
    tags: [cacheTags.publishedCatalog, cacheTags.childMissionMap(child.id)],
    revalidate: 5 * 60,
  })();
}

async function readPublishedMission(identifier: string) {
  const identifierCondition =
    identifier.includes("-") && identifier.length === 36
      ? eq(missions.id, identifier)
      : sql`${missionVersions.snapshot}->>'slug' = ${identifier}`;
  const rows = await db
    .select({ mission: missions, version: missionVersions })
    .from(missions)
    .innerJoin(missionVersions, eq(missions.publishedVersionId, missionVersions.id))
    .where(and(publishedMissionCondition, identifierCondition))
    .limit(1);
  const result = rows[0];
  if (!result) return null;

  const snapshot = parseMissionSnapshot(result.version.snapshot);
  const [world, primarySkill, badge] = await Promise.all([
    snapshot.worldId
      ? db.query.missionWorlds.findFirst({ where: eq(missionWorlds.id, snapshot.worldId) })
      : snapshot.worldSlug
        ? db.query.missionWorlds.findFirst({ where: eq(missionWorlds.slug, snapshot.worldSlug) })
        : null,
    db.query.skills.findFirst({ where: eq(skills.slug, snapshot.primarySkill) }),
    snapshot.rewardBadge ? db.query.badges.findFirst({ where: eq(badges.slug, snapshot.rewardBadge) }) : null,
  ]);
  if (!world || !primarySkill) return null;
  const mission = {
    ...result.mission,
    worldId: snapshot.worldId ?? result.mission.worldId,
    slug: snapshot.slug,
    title: snapshot.title,
    subtitle: snapshot.subtitle,
    shortDescription: snapshot.shortDescription,
    storyIntro: snapshot.storyIntro,
    estimatedMinutes: snapshot.estimatedMinutes,
    coverUrl: snapshot.coverUrl,
    difficulty: snapshot.difficulty,
  };
  return {
    mission,
    world,
    version: result.version,
    primarySkill,
    badge,
    secondarySkills: await resolveSkillLabels(snapshot.secondarySkills),
  };
}

export function getPublishedMission(identifier: string) {
  return unstable_cache(() => readPublishedMission(identifier), ["published-mission", identifier], {
    tags: [cacheTags.publishedCatalog],
    revalidate: 60 * 60,
  })();
}

export async function listPublishedWorlds() {
  return db
    .select()
    .from(missionWorlds)
    .where(eq(missionWorlds.status, "published"))
    .orderBy(asc(missionWorlds.sortOrder));
}

export async function listWorldMissions(worldId: string, ageGroup?: AgeGroup) {
  const rows = await publishedMissionRows();
  return rows
    .map(publishedListItem)
    .filter((mission) => mission.worldId === worldId && (!ageGroup || mission.ageGroups.includes(ageGroup)));
}
