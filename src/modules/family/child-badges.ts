import "server-only";

import { and, eq, isNotNull, or } from "drizzle-orm";
import { db } from "@/db/client";
import { badges, childBadges, missions, skills } from "@/db/schema";

export type ChildBadgeCollectionItem = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  skillTitle: string | null;
  earned: boolean;
  unlockedAt: Date | null;
  sourceMissionTitle: string | null;
};

export async function getChildBadgeCollection(childId: string): Promise<ChildBadgeCollectionItem[]> {
  const rows = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      iconUrl: badges.iconUrl,
      skillTitle: skills.title,
      earnedBadgeId: childBadges.id,
      unlockedAt: childBadges.unlockedAt,
      sourceMissionTitle: missions.title,
    })
    .from(badges)
    .leftJoin(skills, eq(badges.skillId, skills.id))
    .leftJoin(childBadges, and(eq(childBadges.badgeId, badges.id), eq(childBadges.childProfileId, childId)))
    .leftJoin(missions, eq(childBadges.sourceMissionId, missions.id))
    .where(or(eq(badges.active, true), isNotNull(childBadges.id)));

  return rows
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      iconUrl: row.iconUrl,
      skillTitle: row.skillTitle,
      earned: Boolean(row.earnedBadgeId),
      unlockedAt: row.unlockedAt,
      sourceMissionTitle: row.sourceMissionTitle,
    }))
    .sort((left, right) => {
      if (left.earned !== right.earned) return left.earned ? -1 : 1;
      if (left.unlockedAt && right.unlockedAt) {
        return right.unlockedAt.getTime() - left.unlockedAt.getTime();
      }
      return left.name.localeCompare(right.name, "vi");
    });
}
