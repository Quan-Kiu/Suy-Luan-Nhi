import { hasRole, staffRoles } from "@/auth/roles";

export const AUTH_SIGN_IN_PATH = "/auth/sign-in";
export const PARENT_PIN_SETUP_PATH = "/auth/setup-pin";
export const AUTH_COMPLETE_PATH = "/auth/complete";
const AUTH_CALLBACK_BASE = "https://suy-luan-nhi.invalid";

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

export function resolveSafeAuthCallbackPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  if (/[\u0000-\u001F\u007F]/.test(value)) return null;

  try {
    const url = new URL(value, AUTH_CALLBACK_BASE);
    if (url.origin !== AUTH_CALLBACK_BASE || url.pathname === AUTH_SIGN_IN_PATH) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function buildSignInPath(callbackPath?: string | null) {
  const safeCallbackPath = resolveSafeAuthCallbackPath(callbackPath);
  return safeCallbackPath
    ? `${AUTH_SIGN_IN_PATH}?callbackUrl=${encodeURIComponent(safeCallbackPath)}`
    : AUTH_SIGN_IN_PATH;
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
