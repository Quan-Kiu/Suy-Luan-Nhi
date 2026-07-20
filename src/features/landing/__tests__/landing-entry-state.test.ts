import { describe, expect, it } from "vitest";
import { resolveLandingEntryState } from "@/features/landing/landing-entry-state";

const settled = { isPending: false, isRefetching: false };

describe("resolveLandingEntryState", () => {
  it("keeps the entry actions loading until the initial session resolves", () => {
    expect(resolveLandingEntryState({ ...settled, isPending: true, hasUser: false, role: undefined })).toBe(
      "loading",
    );
  });

  it("resolves guest, parent and staff without mixing role content", () => {
    expect(resolveLandingEntryState({ ...settled, hasUser: false, role: undefined })).toBe("guest");
    expect(resolveLandingEntryState({ ...settled, hasUser: true, role: "parent" })).toBe("parent");
    expect(resolveLandingEntryState({ ...settled, hasUser: true, role: "content_admin" })).toBe("staff");
    expect(resolveLandingEntryState({ ...settled, hasUser: true, role: "super_admin" })).toBe("staff");
  });

  it("does not fall back to parent for an unknown signed-in role", () => {
    expect(resolveLandingEntryState({ ...settled, hasUser: true, role: "unknown" })).toBe("forbidden");
  });
});
