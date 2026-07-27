import { describe, expect, it } from "vitest";
import { createAccessRoleSchema } from "@/domain/access-roles";

describe("access role validation", () => {
  it("accepts a custom staff role with administrative permissions", () => {
    expect(
      createAccessRoleSchema.safeParse({
        key: "operations_manager",
        name: "Quản lý vận hành",
        description: "Theo dõi báo cáo và xử lý góp ý hệ thống.",
        permissions: ["reports.view", "feedback.view", "feedback.manage"],
      }).success,
    ).toBe(true);
  });

  it("rejects invalid role keys and family-only permissions", () => {
    expect(
      createAccessRoleSchema.safeParse({
        key: "Operations Manager",
        name: "Quản lý vận hành",
        description: "Theo dõi báo cáo và xử lý góp ý hệ thống.",
        permissions: ["reports.view"],
      }).success,
    ).toBe(false);
    expect(
      createAccessRoleSchema.safeParse({
        key: "family_manager",
        name: "Quản lý gia đình",
        description: "Role nhân sự không được mở chức năng dành riêng cho gia đình.",
        permissions: ["family.children.manage"],
      }).success,
    ).toBe(false);
  });
});
