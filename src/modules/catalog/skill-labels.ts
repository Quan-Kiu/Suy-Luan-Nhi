import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { skills } from "@/db/schema";

export type SkillLabel = {
  slug: string;
  title: string;
  description: string;
};

export async function resolveSkillLabels(slugs: string[]): Promise<SkillLabel[]> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (!unique.length) return [];
  const rows = await db
    .select({ slug: skills.slug, title: skills.title, description: skills.description })
    .from(skills)
    .where(inArray(skills.slug, unique));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return unique.map((slug) => bySlug.get(slug) ?? { slug, title: slug, description: "" });
}
