import type { ContentDefinition, ContentValue } from "@/content/types";
import { classifyContentValue, contentCategoryFromKey } from "@/domain/content-classification";

type Definition = { value: ContentValue; description: string };

export function defineContent(
  namespace: string,
  definitions: Record<string, Definition>,
  locale = "vi",
): ContentDefinition[] {
  return Object.entries(definitions).map(([key, definition]) => ({
    namespace,
    key,
    locale,
    category: contentCategoryFromKey(key),
    valueType: classifyContentValue(definition.value),
    value: definition.value,
    description: definition.description,
  }));
}
