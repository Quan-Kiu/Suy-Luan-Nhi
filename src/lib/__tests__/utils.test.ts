import { describe, expect, it } from "vitest";
import { evaluateAnswer } from "@/lib/utils";

describe("evaluateAnswer", () => {
  it("normalizes spaces and letter case", () => {
    expect(evaluateAnswer("  STAR ", "star")).toBe(true);
  });

  it("does not accept another option", () => {
    expect(evaluateAnswer("moon", "star")).toBe(false);
  });
});
