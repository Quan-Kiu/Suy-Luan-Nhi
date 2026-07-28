import { z } from "zod";

export const systemRoleSchema = z.enum(["parent", "content_admin", "reviewer", "super_admin"]);
export type SystemRole = z.infer<typeof systemRoleSchema>;

export const appRoleSchema = z.enum(["parent", "content_admin", "reviewer", "super_admin", "custom_staff"]);
export type AppRole = z.infer<typeof appRoleSchema>;

export const staffRoles: AppRole[] = ["content_admin", "reviewer", "super_admin", "custom_staff"];

export function parseRoles(value: unknown): AppRole[] {
  const rawRoles = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return rawRoles
    .map((role) => appRoleSchema.safeParse(role.trim()))
    .filter((result) => result.success)
    .map((result) => result.data);
}

export function hasRole(value: unknown, allowedRoles: readonly AppRole[]) {
  return parseRoles(value).some((role) => allowedRoles.includes(role));
}
