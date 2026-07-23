import { describe, expect, it } from "vitest";
import { getAuthenticatedHome, resolveSafeAuthCallbackPath } from "@/auth/navigation";

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
});
