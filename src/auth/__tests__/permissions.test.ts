import { describe, expect, it } from "vitest";
import { getPermissionsForRole, hasPermission, permissionDefinitions } from "@/auth/permissions";

describe("role permission registry", () => {
  it("keeps editor and reviewer duties separated", () => {
    expect(hasPermission("content_admin", "missions.manage")).toBe(true);
    expect(hasPermission("content_admin", "missions.review")).toBe(false);
    expect(hasPermission("reviewer", "missions.review")).toBe(true);
    expect(hasPermission("reviewer", "missions.manage")).toBe(false);
  });

  it("reserves access control and content variables for super admins", () => {
    expect(hasPermission("super_admin", "access_control.view")).toBe(true);
    expect(hasPermission("super_admin", "content_variables.manage")).toBe(true);
    expect(hasPermission("content_admin", "access_control.view")).toBe(false);
    expect(hasPermission("content_admin", "content_variables.manage")).toBe(false);
  });

  it("documents every assigned permission with at least one route", () => {
    const documented = new Set(permissionDefinitions.map((definition) => definition.key));
    for (const role of ["parent", "content_admin", "reviewer", "super_admin"] as const) {
      for (const permission of getPermissionsForRole(role)) {
        expect(documented.has(permission)).toBe(true);
        expect(
          permissionDefinitions.find((definition) => definition.key === permission)?.routes.length,
        ).toBeGreaterThan(0);
      }
    }
  });
});
