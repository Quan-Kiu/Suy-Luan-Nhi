import { describe, expect, it } from "vitest";
import {
  buildParentPinSetupPath,
  buildSignInPath,
  getAuthenticatedHome,
  isParentExperiencePath,
  resolveParentPinSetupNextPath,
  resolveSafeAuthCallbackPath,
} from "@/auth/navigation";

describe("auth navigation", () => {
  it("routes parents and staff to different default workspaces", () => {
    expect(getAuthenticatedHome("parent")).toBe("/parent");
    expect(getAuthenticatedHome("reviewer")).toBe("/admin");
  });

  it("preserves an explicit internal destination", () => {
    expect(resolveSafeAuthCallbackPath("/parent/activity?status=completed#latest")).toBe(
      "/parent/activity?status=completed#latest",
    );
  });

  it.each(["https://example.com/admin", "//example.com/admin", "/\\example.com", "/auth/sign-in"])(
    "rejects unsafe or looping callback %s",
    (callback) => {
      expect(resolveSafeAuthCallbackPath(callback)).toBeNull();
    },
  );

  it("builds a sign-in destination that preserves the current protected page", () => {
    expect(buildSignInPath("/parent/notifications?filter=unread#latest")).toBe(
      "/auth/sign-in?callbackUrl=%2Fparent%2Fnotifications%3Ffilter%3Dunread%23latest",
    );
  });

  it("does not create a recursive or external sign-in callback", () => {
    expect(buildSignInPath("/auth/sign-in?callbackUrl=/parent")).toBe("/auth/sign-in");
    expect(buildSignInPath("https://example.com/admin")).toBe("/auth/sign-in");
  });
});

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
