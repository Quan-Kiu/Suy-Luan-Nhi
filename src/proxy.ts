import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import { isTrustedRequestOrigin } from "@/lib/origin";

const protectedPrefixes = ["/parent", "/admin", "/profiles", "/missions", "/play", "/complete"];
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("better-auth.session_token"));
  if (hasSessionCookie) return NextResponse.next();

  const target = new URL("/auth/sign-in", request.url);
  target.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(target);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/parent/:path*",
    "/admin/:path*",
    "/profiles/:path*",
    "/missions/:path*",
    "/play/:path*",
    "/complete/:path*",
  ],
};
