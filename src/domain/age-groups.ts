export const ageGroupCodes = ["6-8", "9-10", "11-12"] as const;

export type AgeGroup = (typeof ageGroupCodes)[number];

export function isAgeGroup(value: unknown): value is AgeGroup {
  return typeof value === "string" && ageGroupCodes.includes(value as AgeGroup);
}
