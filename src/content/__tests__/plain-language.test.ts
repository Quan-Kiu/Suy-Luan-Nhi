import { describe, expect, it } from "vitest";
import { defaultContentEntries } from "@/content/defaults";
import { badgeSeeds, missionSeeds, skillSeeds, worldSeeds } from "@/content/catalog/game-content";
import { conversationSuggestionSeeds, parentResourceSeeds } from "@/content/catalog/parent-content";
import { ageGroupSeeds, safetyChecklistDefinitions } from "@/content/catalog/taxonomy-content";

type LocatedText = { source: string; value: string };

function collectStrings(value: unknown, source: string): LocatedText[] {
  if (typeof value === "string") return [{ source, value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${source}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${source}.${key}`));
  }
  return [];
}

const registeredCopy = defaultContentEntries.flatMap((entry) =>
  collectStrings(entry.value, `${entry.namespace}.${entry.key}`),
);
const registeredDescriptions = defaultContentEntries.map((entry) => ({
  source: `${entry.namespace}.${entry.key}.description`,
  value: entry.description,
}));

const seededCopy = [
  ...collectStrings(skillSeeds, "skillSeeds"),
  ...collectStrings(worldSeeds, "worldSeeds"),
  ...collectStrings(missionSeeds, "missionSeeds"),
  ...collectStrings(badgeSeeds, "badgeSeeds"),
  ...collectStrings(conversationSuggestionSeeds, "conversationSuggestionSeeds"),
  ...collectStrings(parentResourceSeeds, "parentResourceSeeds"),
  ...collectStrings(ageGroupSeeds, "ageGroupSeeds"),
  ...collectStrings(safetyChecklistDefinitions, "safetyChecklistDefinitions"),
];

const userFacingCopy = [...registeredCopy, ...registeredDescriptions, ...seededCopy];

function findMatches(pattern: RegExp) {
  return userFacingCopy
    .filter((item) => pattern.test(item.value))
    .map((item) => `${item.source}: ${item.value}`);
}

describe("plain-language content", () => {
  it("does not expose internal product or implementation terms", () => {
    expect(
      findMatches(
        /\b(?:CMS|Role|Preview|Child Renderer|Parent Gate|Child Profile|Parent Workspace|payload|snapshot|taxonomy|namespace|locale|JSON|CTA|Placeholder|Alt text)\b/i,
      ),
    ).toEqual([]);
  });

  it("keeps editor descriptions free from implementation language", () => {
    const matches = registeredDescriptions
      .filter((item) => /\b(?:Mission|session|CTA|Placeholder|Alt text)\b/i.test(item.value))
      .map((item) => `${item.source}: ${item.value}`);
    expect(matches).toEqual([]);
  });

  it("uses task-focused words for editorial workflows", () => {
    expect(findMatches(/\b(?:xuất bản|kiểm duyệt|tư liệu|phiên bản)\b/i)).toEqual([]);
  });

  it("does not describe an incorrect answer as a lucky miss", () => {
    expect(findMatches(/chưa(?:\s+|-)+(?:trúng|chúng)/i)).toEqual([]);
  });
});
