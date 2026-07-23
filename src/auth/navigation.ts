import { hasRole, staffRoles } from "@/auth/roles";

export const PARENT_PIN_SETUP_PATH = "/auth/setup-pin";
export const AUTH_COMPLETE_PATH = "/auth/complete";

export function resolveSafeInternalPath(value: string | string[] | null | undefined, fallback: string) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate === "/api" ||
    candidate.startsWith("/api/") ||
    candidate.startsWith(AUTH_COMPLETE_PATH)
  ) {
    return fallback;
  }
  return candidate;
}

export function buildAuthCompletePath(nextPath?: string | null) {
  if (!nextPath) return AUTH_COMPLETE_PATH;
  const safeNextPath = resolveSafeInternalPath(nextPath, "/parent");
  return `${AUTH_COMPLETE_PATH}?next=${encodeURIComponent(safeNextPath)}`;
}

const PARENT_EXPERIENCE_PATHS = [
  "/parent",
  "/profiles",
  "/onboarding",
  "/missions",
  "/badges",
  "/play",
  "/complete",
] as const;

export function isParentExperiencePath(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0] ?? pathname;
  return PARENT_EXPERIENCE_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getAuthenticatedHome(role: unknown) {
  return hasRole(role, staffRoles) ? "/admin" : "/parent";
}

export function resolveParentPinSetupNextPath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.startsWith(PARENT_PIN_SETUP_PATH)
  ) {
    return "/profiles";
  }
  return candidate;
}

export function buildParentPinSetupPath(nextPath: string) {
  const safeNextPath = resolveParentPinSetupNextPath(nextPath);
  return `${PARENT_PIN_SETUP_PATH}?next=${encodeURIComponent(safeNextPath)}`;
}
