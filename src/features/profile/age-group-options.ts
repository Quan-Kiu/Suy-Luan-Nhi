import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";

export type AgeGroupCode = AgeGroup;

export function getAgeGroupOptions(content: ContentDictionary) {
  return ageGroupCodes.map((id) => ({
    id,
    title: contentText(content, `create.age.${id}.title`, `${id} tuổi`),
    note: contentText(content, `create.age.${id}.note`, "Nhiệm vụ phù hợp theo độ tuổi"),
  }));
}
