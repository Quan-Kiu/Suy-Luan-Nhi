import { and, asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { defaultContentEntries, getDefaultContent } from "@/content/defaults";
import type { ContentDictionary, ContentValue } from "@/content/types";
import { db } from "@/db/client";
import { auditLogs, contentEntries } from "@/db/schema";
import { cacheTags } from "@/lib/cache/tags";
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

async function readContentEntries(locale: string) {
  const stored = await db.query.contentEntries.findMany({
    where: eq(contentEntries.locale, locale),
    orderBy: [asc(contentEntries.namespace), asc(contentEntries.key)],
  });
  const byIdentity = new Map(stored.map((entry) => [`${entry.namespace}:${entry.key}`, entry]));
  return defaultContentEntries
    .filter((entry) => entry.locale === locale)
    .map((definition) => {
      const storedEntry = byIdentity.get(`${definition.namespace}:${definition.key}`);
      return {
        namespace: definition.namespace,
        key: definition.key,
        locale,
        value: (storedEntry?.value as ContentValue | undefined) ?? definition.value,
        description: storedEntry?.description ?? definition.description,
        active: storedEntry?.active ?? true,
        source: storedEntry ? ("database" as const) : ("default" as const),
      };
    });
}

const getCachedContentEntries = unstable_cache(readContentEntries, ["content-entry-list"], {
  tags: [cacheTags.content],
  revalidate: 3600,
});

export function listContentEntries(locale = "vi") {
  return getCachedContentEntries(locale);
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
    .values({ ...input, active: input.active ?? true, updatedBy: actorId })
    .onConflictDoUpdate({
      target: [contentEntries.namespace, contentEntries.key, contentEntries.locale],
      set: {
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
