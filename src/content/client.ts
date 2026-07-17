"use client";

import { useQuery } from "@tanstack/react-query";
import { contentApi } from "@/api/content";
import { getDefaultContent } from "@/content/defaults";
import type { ContentDictionary } from "@/content/types";
import { queryKeys } from "@/lib/query/keys";
export { contentTemplate, contentText } from "@/content/resolve";

export function useContentQuery(namespace: string, locale = "vi") {
  const defaults = getDefaultContent(namespace, locale);
  const query = useQuery({
    queryKey: queryKeys.content.namespace(namespace, locale),
    queryFn: () => contentApi.getNamespace(namespace, locale),
    placeholderData: defaults,
    staleTime: 5 * 60_000,
  });
  return { ...query, data: query.data ?? defaults };
}

export function useContent(namespace: string, locale = "vi"): ContentDictionary {
  return useContentQuery(namespace, locale).data;
}
