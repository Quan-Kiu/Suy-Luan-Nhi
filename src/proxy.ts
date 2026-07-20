import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import { isTrustedRequestOrigin } from "@/lib/origin";
import { shouldRelockParentGate } from "@/lib/navigation/parent-gate-relock";
import { PARENT_GATE_COOKIE_NAME } from "@/modules/family/parent-gate-constants";

const protectedPrefixes = ["/parent", "/admin", "/profiles", "/missions", "/play", "/complete"];
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
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

  if (!protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return nextResponse();
  }

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
