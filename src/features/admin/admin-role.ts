import { parseRoles, type AppRole } from "@/auth/roles";

const rolePriority: AppRole[] = ["super_admin", "reviewer", "content_admin", "custom_staff", "parent"];

const roleLabels: Record<AppRole, string> = {
  parent: "Phụ huynh",
  content_admin: "Biên tập nội dung",
  reviewer: "Người kiểm tra nội dung",
  super_admin: "Quản trị viên",
  custom_staff: "Vai trò tùy chỉnh",
};

export function getPrimaryRole(value: unknown): AppRole {
  const roles = parseRoles(value);
  return rolePriority.find((role) => roles.includes(role)) ?? "content_admin";
}

export function getRoleLabel(value: unknown) {
  return roleLabels[getPrimaryRole(value)];
}
