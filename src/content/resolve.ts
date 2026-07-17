import type { ContentDictionary } from "@/content/types";

export function contentText(dictionary: ContentDictionary, key: string, fallback: string): string {
  return typeof dictionary[key] === "string" ? dictionary[key] : fallback;
}

export function contentTemplate(
  dictionary: ContentDictionary,
  key: string,
  fallback: string,
  values: Record<string, string | number>,
): string {
  const template = contentText(dictionary, key, fallback);
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export function contentList(dictionary: ContentDictionary, key: string, fallback: string[]): string[] {
  const value = dictionary[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
}
