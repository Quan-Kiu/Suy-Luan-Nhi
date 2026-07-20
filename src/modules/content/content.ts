import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { defaultContentEntries, getDefaultContent } from "@/content/defaults";
import type { ContentDictionary, ContentValue } from "@/content/types";
import { db } from "@/db/client";
import { auditLogs, contentEntries } from "@/db/schema";
import { cacheTags } from "@/lib/cache/tags";
import {
  classifyContentValue,
  contentCategoryFromKey,
  type ContentValueType,
} from "@/domain/content-classification";
import { isDatabaseUnavailable } from "@/lib/infrastructure";

async function readContentNamespace(namespace: string, locale: string): Promise<ContentDictionary> {
  const defaults = getDefaultContent(namespace, locale);
  try {
    const rows = await db.query.contentEntries.findMany({
      where: and(
        eq(contentEntries.namespace, namespace),
        eq(contentEntries.locale, locale),
        eq(contentEntries.active, true),
      ),
      orderBy: [asc(contentEntries.key)],
    });
    return { ...defaults, ...Object.fromEntries(rows.map((row) => [row.key, row.value as ContentValue])) };
  } catch (error) {
    if (isDatabaseUnavailable(error)) return defaults;
    throw error;
  }
}

const getCachedContentNamespace = unstable_cache(readContentNamespace, ["content-namespace"], {
  tags: [cacheTags.content],
  revalidate: 3600,
});

export function getContentNamespace(namespace: string, locale = "vi") {
  return getCachedContentNamespace(namespace, locale);
}

export type ContentEntryListFilters = {
  locale?: string;
  namespace?: string;
  category?: string;
  valueType?: ContentValueType;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listContentEntries(filters: ContentEntryListFilters = {}) {
  const locale = filters.locale ?? "vi";
  const stored = await db.query.contentEntries.findMany({
    where: eq(contentEntries.locale, locale),
    orderBy: [asc(contentEntries.namespace), asc(contentEntries.key)],
  });
  const byIdentity = new Map(stored.map((entry) => [`${entry.namespace}:${entry.key}`, entry]));
  const defaultIdentities = new Set<string>();
  const rows = defaultContentEntries
    .filter((entry) => entry.locale === locale)
    .map((definition) => {
      const identity = `${definition.namespace}:${definition.key}`;
      defaultIdentities.add(identity);
      const storedEntry = byIdentity.get(identity);
      return {
        namespace: definition.namespace,
        key: definition.key,
        locale,
        category: storedEntry?.category ?? definition.category,
        valueType: storedEntry?.valueType ?? definition.valueType,
        value: (storedEntry?.value as ContentValue | undefined) ?? definition.value,
        description: storedEntry?.description ?? definition.description,
        active: storedEntry?.active ?? true,
        source: storedEntry ? ("database" as const) : ("default" as const),
      };
    });
  for (const entry of stored) {
    if (defaultIdentities.has(`${entry.namespace}:${entry.key}`)) continue;
    rows.push({
      namespace: entry.namespace,
      key: entry.key,
      locale: entry.locale,
      category: entry.category,
      valueType: entry.valueType,
      value: entry.value as ContentValue,
      description: entry.description ?? "Nội dung tùy chỉnh",
      active: entry.active,
      source: "database" as const,
    });
  }

  const needle = filters.search?.trim().toLocaleLowerCase("vi");
  const filtered = rows.filter((entry) => {
    if (filters.namespace && entry.namespace !== filters.namespace) return false;
    if (filters.category && entry.category !== filters.category) return false;
    if (filters.valueType && entry.valueType !== filters.valueType) return false;
    if (!needle) return true;
    return `${entry.namespace} ${entry.category} ${entry.key} ${entry.description} ${JSON.stringify(entry.value)}`
      .toLocaleLowerCase("vi")
      .includes(needle);
  });
  const pageSize = Math.min(50, Math.max(5, Math.trunc(filters.pageSize ?? 12)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const total = filtered.length;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    facets: {
      namespaces: [...new Set(rows.map((entry) => entry.namespace))].sort(),
      categories: [...new Set(rows.map((entry) => entry.category))].sort(),
      valueTypes: [...new Set(rows.map((entry) => entry.valueType))].sort(),
    },
  };
}

export async function upsertContentEntry(
  actorId: string,
  input: {
    namespace: string;
    key: string;
    locale: string;
    value: ContentValue;
    description?: string;
    active?: boolean;
  },
) {
  const [entry] = await db
    .insert(contentEntries)
    .values({
      ...input,
      category: contentCategoryFromKey(input.key),
      valueType: classifyContentValue(input.value),
      active: input.active ?? true,
      updatedBy: actorId,
    })
    .onConflictDoUpdate({
      target: [contentEntries.namespace, contentEntries.key, contentEntries.locale],
      set: {
        category: contentCategoryFromKey(input.key),
        valueType: classifyContentValue(input.value),
        value: input.value,
        description: input.description,
        active: input.active ?? true,
        updatedBy: actorId,
        updatedAt: new Date(),
      },
    })
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "content.updated",
    resourceType: "content_entry",
    resourceId: `${input.namespace}:${input.key}:${input.locale}`,
    afterState: entry,
  });
  return entry;
}
