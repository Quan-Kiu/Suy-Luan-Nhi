import { describe, expect, it } from "vitest";
import { auditActionLabels, friendlyLabel, resourceTypeLabels } from "@/features/admin/admin-labels";
import { getPrimaryRole, getRoleLabel } from "@/features/admin/admin-role";

describe("admin presentation helpers", () => {
  it("translates stored audit values into plain Vietnamese", () => {
    expect(friendlyLabel(auditActionLabels, "data.export_requested")).toBe("Yêu cầu tải xuống dữ liệu");
    expect(friendlyLabel(auditActionLabels, "system_setting.updated")).toBe("Cập nhật cấu hình hệ thống");
    expect(friendlyLabel(resourceTypeLabels, "child_profile")).toBe("Hồ sơ bé");
  });

  it("keeps unknown values readable instead of exposing separators", () => {
    expect(friendlyLabel({}, "custom_event.created")).toBe("custom event · created");
  });

  it("uses the highest staff role and a human-readable label", () => {
    expect(getPrimaryRole("content_admin,reviewer")).toBe("reviewer");
    expect(getRoleLabel("super_admin")).toBe("Quản trị viên");
  });
});
