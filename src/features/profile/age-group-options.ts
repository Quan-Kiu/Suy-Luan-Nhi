import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";

export const ageGroupCodes = ["2-3", "4-5", "6-8"] as const;
export type AgeGroupCode = (typeof ageGroupCodes)[number];

export function getAgeGroupOptions(content: ContentDictionary) {
  return ageGroupCodes.map((id) => ({
    id,
    title: contentText(content, `create.age.${id}.title`, `${id} tuổi`),
    note: contentText(content, `create.age.${id}.note`, "Nhiệm vụ phù hợp theo độ tuổi"),
  }));
}
