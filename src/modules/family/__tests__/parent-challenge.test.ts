import { describe, expect, it } from "vitest";
import { createParentMathChallenge, verifyParentMathChallenge } from "@/modules/family/parent-challenge";

function solve(prompt: string) {
  const match = prompt.match(/(\d+)\s*([+-])\s*(\d+)/);
  if (!match) throw new Error("Invalid prompt");
  const left = Number(match[1]);
  const right = Number(match[3]);
  return String(match[2] === "+" ? left + right : left - right);
}

describe("parent math challenge", () => {
  it("accepts the correct signed answer", () => {
    const challenge = createParentMathChallenge();
    expect(verifyParentMathChallenge(challenge.token, solve(challenge.prompt))).toBe(true);
    expect(verifyParentMathChallenge(challenge.token, "9999")).toBe(false);
  });

  it("rejects a tampered token", () => {
    const challenge = createParentMathChallenge();
    const tampered = `${challenge.token.slice(0, -1)}x`;
    expect(verifyParentMathChallenge(tampered, solve(challenge.prompt))).toBe(false);
  });

  it("generates fresh challenge tokens and varying prompts", () => {
    const challenges = Array.from({ length: 12 }, createParentMathChallenge);
    expect(new Set(challenges.map((item) => item.token)).size).toBe(challenges.length);
    expect(new Set(challenges.map((item) => item.prompt)).size).toBeGreaterThan(1);
  });
});
