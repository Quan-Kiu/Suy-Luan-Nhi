import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function secureTokenEquals(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function bearerTokenMiddleware(expectedToken: string) {
  return (request: Request, response: Response, next: NextFunction) => {
    const authorization = request.header("authorization") ?? "";
    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token || !secureTokenEquals(token, expectedToken)) {
      response.setHeader("WWW-Authenticate", "Bearer");
      response.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  };
}

type RateEntry = { count: number; windowStartedAt: number };

export function rateLimitMiddleware(limitPerMinute: number) {
  const entries = new Map<string, RateEntry>();
  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip || "unknown";
    const now = Date.now();
    const entry = entries.get(key);
    if (!entry || now - entry.windowStartedAt >= 60_000) {
      entries.set(key, { count: 1, windowStartedAt: now });
      next();
      return;
    }
    if (entry.count >= limitPerMinute) {
      response.setHeader("Retry-After", "60");
      response.status(429).json({ error: "Too many MCP requests" });
      return;
    }
    entry.count += 1;
    next();
  };
}

export function corsMiddleware(origins: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.header("origin");
    if (origin && origins.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Credentials", "true");
    }
    response.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, MCP-Session-Id, Last-Event-ID",
    );
    response.setHeader("Access-Control-Expose-Headers", "MCP-Session-Id");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }
    next();
  };
}
