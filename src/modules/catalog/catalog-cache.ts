import { unstable_cache } from "next/cache";
import type { AgeGroup } from "@/domain/age-groups";
import { cacheTags } from "@/lib/cache/tags";
import { getMissionMap, getPublishedMission } from "@/modules/catalog/catalog";

export function getCachedMissionMap(child: {
  id: string;
  ageGroup: AgeGroup;
  displayName?: string | null;
  currentRank?: string | null;
}) {
  return unstable_cache(
    () => getMissionMap(child),
    ["child-mission-map", child.id, child.ageGroup, child.displayName ?? "", child.currentRank ?? ""],
    {
      tags: [cacheTags.publishedCatalog, cacheTags.childMissionMap(child.id)],
      revalidate: 5 * 60,
    },
  )();
}

export function getCachedPublishedMission(identifier: string) {
  return unstable_cache(() => getPublishedMission(identifier), ["published-mission", identifier], {
    tags: [cacheTags.publishedCatalog],
    revalidate: 60 * 60,
  })();
}
