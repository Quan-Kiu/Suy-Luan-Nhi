import { describe, expect, it } from "vitest";
import { getAccountMethods, partitionMembersByAccess } from "@/features/admin/member-presentation";

describe("member presentation", () => {
  it("labels and orders credential and Google sign-in methods without duplicates", () => {
    expect(getAccountMethods(["google", "credential", "google"])).toEqual([
      { providerId: "credential", label: "Email & mật khẩu" },
      { providerId: "google", label: "Google" },
    ]);
  });

  it("keeps unknown providers readable and handles missing account data", () => {
    expect(getAccountMethods(["custom_sso"])).toEqual([{ providerId: "custom_sso", label: "Custom Sso" }]);
    expect(getAccountMethods([])).toEqual([{ providerId: "unknown", label: "Chưa xác định" }]);
  });

  it("partitions every account into staff or parent access", () => {
    const items = [
      { id: "parent", role: "parent" },
      { id: "editor", role: "content_admin" },
      { id: "reviewer", role: "reviewer" },
      { id: "admin", role: "super_admin" },
    ];

    const result = partitionMembersByAccess(items);

    expect(result.parents.map((item) => item.id)).toEqual(["parent"]);
    expect(result.staff.map((item) => item.id)).toEqual(["editor", "reviewer", "admin"]);
    expect(result.parents.length + result.staff.length).toBe(items.length);
  });
});
