import { describe, expect, it } from "vitest";
import { missingWorldAgeGroups } from "@/domain/mission-publication";

describe("mission publication audience", () => {
  it("accepts a world that covers every mission age group", () => {
    expect(missingWorldAgeGroups(["6-8", "9-10"], ["6-8", "9-10", "11-12"])).toEqual([]);
  });

  it("returns every mission age group hidden by the world", () => {
    expect(missingWorldAgeGroups(["6-8", "9-10", "11-12"], ["6-8"])).toEqual(["9-10", "11-12"]);
  });

  it("rejects a world with no configured audience", () => {
    expect(missingWorldAgeGroups(["6-8"], [])).toEqual(["6-8"]);
  });
});
