import { describe, expect, it } from "vitest";
import {
  buildEmailVerificationCallback,
  resolveEmailVerificationResult,
  resolveVerificationContinuePath,
} from "@/auth/email-verification";

describe("email verification navigation", () => {
  it("builds a dedicated callback that preserves the internal destination", () => {
    expect(buildEmailVerificationCallback("/parent?tab=progress")).toBe(
      "/auth/verify-email?next=%2Fparent%3Ftab%3Dprogress",
    );
  });

  it("rejects external, recursive, and malformed destinations", () => {
    expect(resolveVerificationContinuePath("https://example.com")).toBe("/profiles");
    expect(resolveVerificationContinuePath("//example.com")).toBe("/profiles");
    expect(resolveVerificationContinuePath("/auth/verify-email?next=/admin")).toBe("/profiles");
    expect(resolveVerificationContinuePath("/\\evil.example")).toBe("/profiles");
  });

  it("maps verification callback errors to user-facing states", () => {
    expect(resolveEmailVerificationResult(undefined)).toBe("success");
    expect(resolveEmailVerificationResult("TOKEN_EXPIRED")).toBe("expired");
    expect(resolveEmailVerificationResult("INVALID_TOKEN")).toBe("invalid");
    expect(resolveEmailVerificationResult("USER_NOT_FOUND")).toBe("error");
  });
});
