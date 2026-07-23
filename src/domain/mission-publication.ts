import type { AgeGroup } from "@/domain/age-groups";

export function missingWorldAgeGroups(
  missionAgeGroups: readonly AgeGroup[],
  worldAgeGroups: readonly AgeGroup[],
): AgeGroup[] {
  const supported = new Set(worldAgeGroups);
  return missionAgeGroups.filter((ageGroup) => !supported.has(ageGroup));
}
