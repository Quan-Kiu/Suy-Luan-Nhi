import { hasRole, parseRoles, staffRoles } from "@/auth/roles";

export type LandingEntryState = "loading" | "guest" | "parent" | "staff" | "forbidden";

export function resolveLandingEntryState({
  isPending,
  isRefetching,
  hasUser,
  role,
}: {
  isPending: boolean;
  isRefetching: boolean;
  hasUser: boolean;
  role: unknown;
}): LandingEntryState {
  if (isPending || (isRefetching && !hasUser)) return "loading";
  if (!hasUser) return "guest";
  if (hasRole(role, staffRoles)) return "staff";
  if (parseRoles(role).includes("parent")) return "parent";
  return "forbidden";
}
