import { beforeEach, describe, expect, it } from "vitest";
import { getCompletedMissionIds, markMissionComplete } from "@/lib/progress-store";

describe("progress store", () => {
  beforeEach(() => window.localStorage.clear());

  it("recovers from malformed storage", () => {
    window.localStorage.setItem("sln.completed-missions", "not-json");
    expect(getCompletedMissionIds()).toEqual([]);
  });

  it("deduplicates completed mission ids", () => {
    expect(markMissionComplete("footprint-detective")).toBe(true);
    expect(markMissionComplete("footprint-detective")).toBe(true);
    expect(getCompletedMissionIds()).toEqual(["footprint-detective"]);
  });
});
