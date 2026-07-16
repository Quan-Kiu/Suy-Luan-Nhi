"use client";

import { useQuery } from "@tanstack/react-query";
import { getDefaultContent } from "@/content/defaults";
import type { ContentDictionary } from "@/content/types";
import { requestJson } from "@/lib/http";

export function useContent(namespace: string, locale = "vi"): ContentDictionary {
  const defaults = getDefaultContent(namespace, locale);
  const query = useQuery({
    queryKey: ["content", namespace, locale],
    queryFn: () =>
      requestJson<ContentDictionary>(
        `/api/content?namespace=${encodeURIComponent(namespace)}&locale=${encodeURIComponent(locale)}`,
      ),
    placeholderData: defaults,
    staleTime: 5 * 60_000,
  });
  return query.data ?? defaults;
}

export function contentText(dictionary: ContentDictionary, key: string, fallback: string): string {
  return typeof dictionary[key] === "string" ? dictionary[key] : fallback;
}
