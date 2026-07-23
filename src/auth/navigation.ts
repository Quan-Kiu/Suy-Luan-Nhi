import { hasRole, staffRoles } from "@/auth/roles";

const AUTH_CALLBACK_BASE = "https://suy-luan-nhi.invalid";

export function getAuthenticatedHome(role: unknown) {
  return hasRole(role, staffRoles) ? "/admin" : "/parent";
}

export function resolveSafeAuthCallbackPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  if (/[\u0000-\u001F\u007F]/.test(value)) return null;

  try {
    const url = new URL(value, AUTH_CALLBACK_BASE);
    if (url.origin !== AUTH_CALLBACK_BASE || url.pathname === "/auth/sign-in") return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
