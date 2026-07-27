import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import { isTrustedRequestOrigin } from "@/lib/origin";
import { shouldRelockParentGate } from "@/lib/navigation/parent-gate-relock";
import { PARENT_GATE_COOKIE_NAME } from "@/modules/family/parent-gate-constants";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

const protectedPrefixes = ["/parent", "/admin", "/profiles", "/missions", "/play", "/complete"];
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const maintenanceBypassPrefixes = [
  "/maintenance",
  "/admin",
  "/api/admin",
  "/api/auth",
  "/api/health",
  "/api/cron",
  "/auth",
  "/service-unavailable",
  "/uploads",
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isMaintenanceBypass(pathname: string) {
  return maintenanceBypassPrefixes.some((prefix) => matchesPrefix(pathname, prefix));
}

function isSocialAuthStartRequest(request: NextRequest) {
  return request.method === "POST" && request.nextUrl.pathname === "/api/auth/sign-in/social";
}

function getSocialCallbackProvider(pathname: string) {
  const prefix = "/api/auth/callback/";
  if (!pathname.startsWith(prefix)) return null;
  const provider = pathname.slice(prefix.length).split("/")[0];
  return provider || null;
}

async function isSignUpRequest(request: NextRequest) {
  if (request.method !== "POST") return false;
  if (request.nextUrl.pathname.startsWith("/api/auth/sign-up")) return true;
  if (!isSocialAuthStartRequest(request)) return false;

  const body = await request
    .clone()
    .json()
    .catch(() => null);
  return Boolean(body && typeof body === "object" && "requestSignUp" in body && body.requestSignUp === true);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const socialCallbackProvider = getSocialCallbackProvider(pathname);
  const settings = await getOperationalSystemSettings({
    fresh:
      isSocialAuthStartRequest(request) ||
      Boolean(socialCallbackProvider) ||
      pathname.startsWith("/api/auth/sign-up"),
  });
  const shouldRelockParent = shouldRelockParentGate({
    pathname,
    hasGateCookie: Boolean(request.cookies.get(PARENT_GATE_COOKIE_NAME)),
    headers: request.headers,
  });
  const nextResponse = () => {
    const response = NextResponse.next();
    if (shouldRelockParent) response.cookies.delete(PARENT_GATE_COOKIE_NAME);
    return response;
  };

  if (
    !settings.features.socialLoginEnabled &&
    (isSocialAuthStartRequest(request) || socialCallbackProvider)
  ) {
    if (socialCallbackProvider && request.method === "GET") {
      const target = new URL("/auth/sign-in", request.url);
      target.searchParams.set("oauth", socialCallbackProvider);
      target.searchParams.set("error", "SOCIAL_LOGIN_DISABLED");
      return NextResponse.redirect(target);
    }
    return apiJson(
      { code: "SOCIAL_LOGIN_DISABLED", message: "Đăng nhập bằng tài khoản mạng xã hội đang tạm tắt" },
      { status: 403 },
    );
  }

  if ((await isSignUpRequest(request)) && !settings.features.registrationEnabled) {
    return apiJson(
      { code: "REGISTRATION_DISABLED", message: "Hệ thống đang tạm dừng tiếp nhận tài khoản mới" },
      { status: 403 },
    );
  }

  if (settings.maintenance.enabled && !isMaintenanceBypass(pathname)) {
    if (pathname.startsWith("/api/")) {
      return apiJson(
        { code: "MAINTENANCE_MODE", message: settings.maintenance.message },
        { status: 503, headers: { "Retry-After": "300" } },
      );
    }
    const target = new URL("/maintenance", request.url);
    target.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
    const response = NextResponse.redirect(target);
    if (shouldRelockParent) response.cookies.delete(PARENT_GATE_COOKIE_NAME);
    return response;
  }

  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/cron/") &&
    mutationMethods.has(request.method)
  ) {
    const trustedOrigin = isTrustedRequestOrigin({
      origin: request.headers.get("origin"),
      requestOrigin: request.nextUrl.origin,
      host: request.headers.get("host"),
      forwardedHost: request.headers.get("x-forwarded-host"),
      forwardedProto: request.headers.get("x-forwarded-proto"),
    });
    if (!trustedOrigin) {
      return apiJson(
        { message: "Cross-origin mutation is not allowed", code: "INVALID_ORIGIN" },
        { status: 403 },
      );
    }
  }

  if (!protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix))) return nextResponse();

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("better-auth.session_token"));
  if (hasSessionCookie) return nextResponse();

  const target = new URL("/auth/sign-in", request.url);
  target.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(target);
  if (shouldRelockParent) response.cookies.delete(PARENT_GATE_COOKIE_NAME);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/maintenance",
    "/onboarding/:path*",
    "/worlds/:path*",
    "/api/:path*",
    "/parent/:path*",
    "/admin/:path*",
    "/profiles/:path*",
    "/missions/:path*",
    "/play/:path*",
    "/complete/:path*",
  ],
};
