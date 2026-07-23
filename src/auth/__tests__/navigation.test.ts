import { describe, expect, it } from "vitest";
import {
  buildParentPinSetupPath,
  isParentExperiencePath,
  resolveParentPinSetupNextPath,
} from "@/auth/navigation";

describe("parent PIN navigation", () => {
  it.each([
    "/parent",
    "/parent/settings",
    "/profiles",
    "/profiles/child-id/edit",
    "/onboarding",
    "/missions/mission-id",
    "/badges",
    "/play/session-id",
    "/complete/session-id",
  ])("classifies %s as part of the family experience", (pathname) => {
    expect(isParentExperiencePath(pathname)).toBe(true);
  });

  it.each(["/", "/admin", "/admin/missions", "/auth/sign-in", "/parental-guidance"])(
    "does not classify %s as part of the family experience",
    (pathname) => {
      expect(isParentExperiencePath(pathname)).toBe(false);
    },
  );

  it("preserves and encodes a safe internal destination", () => {
    expect(buildParentPinSetupPath("/onboarding?source=signup")).toBe(
      "/auth/setup-pin?next=%2Fonboarding%3Fsource%3Dsignup",
    );
  });

  it.each(["https://example.com", "//example.com", "/\\example.com", "/auth/setup-pin"])(
    "falls back for unsafe or recursive destination %s",
    (destination) => {
      expect(resolveParentPinSetupNextPath(destination)).toBe("/profiles");
    },
  );
});
