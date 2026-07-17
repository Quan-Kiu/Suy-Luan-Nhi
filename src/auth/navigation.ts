import { hasRole, staffRoles } from "@/auth/roles";

export function getAuthenticatedHome(role: unknown) {
  return hasRole(role, staffRoles) ? "/admin" : "/parent";
}
