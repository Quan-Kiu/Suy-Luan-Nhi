export type SkillDefinition = {
  slug: string;
  title: string;
};

export type SkillSummary = SkillDefinition & {
  count: number;
};

export function buildSkillSummaries(
  skillTotals: ReadonlyMap<string, number>,
  definitions: readonly SkillDefinition[],
): SkillSummary[] {
  const titles = new Map(definitions.map((skill) => [skill.slug, skill.title]));

  return [...skillTotals.entries()]
    .sort(([leftSlug, leftCount], [rightSlug, rightCount]) =>
      rightCount === leftCount ? leftSlug.localeCompare(rightSlug) : rightCount - leftCount,
    )
    .map(([slug, count]) => ({
      slug,
      title: titles.get(slug) ?? slug,
      count,
    }));
}
