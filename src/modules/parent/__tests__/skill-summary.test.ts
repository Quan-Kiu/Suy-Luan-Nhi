import { describe, expect, it } from "vitest";
import { buildSkillSummaries } from "@/modules/parent/skill-summary";

describe("buildSkillSummaries", () => {
  it("uses Vietnamese skill titles and sorts by count", () => {
    const totals = new Map([
      ["cause", 1],
      ["observe", 2],
      ["retry", 1],
    ]);

    expect(
      buildSkillSummaries(totals, [
        { slug: "observe", title: "Quan sát" },
        { slug: "cause", title: "Nguyên nhân – kết quả" },
        { slug: "retry", title: "Biết thử lại" },
      ]),
    ).toEqual([
      { slug: "observe", title: "Quan sát", count: 2 },
      { slug: "cause", title: "Nguyên nhân – kết quả", count: 1 },
      { slug: "retry", title: "Biết thử lại", count: 1 },
    ]);
  });

  it("keeps the slug as a safe fallback when a definition is missing", () => {
    expect(buildSkillSummaries(new Map([["custom-skill", 1]]), [])).toEqual([
      { slug: "custom-skill", title: "custom-skill", count: 1 },
    ]);
  });
});
