import type { ContentDefinition, ContentValue } from "@/content/types";

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
    value: definition.value,
    description: definition.description,
  }));
}
