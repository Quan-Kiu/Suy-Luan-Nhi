import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimit } from "@/db/schema";

const WINDOW_MS = 15 * 60 * 1000;

function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  const agent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${address}|${agent}`).digest("hex").slice(0, 32);
}

async function consume(key: string, maxRequests: number) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const [entry] = await db
    .insert(rateLimit)
    .values({ id: key, key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${rateLimit.lastRequest} < ${windowStart} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${rateLimit.lastRequest} < ${windowStart} then ${now} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count });
  return (entry?.count ?? maxRequests + 1) <= maxRequests;
}

export function consumePinResetRequestRateLimit(userId: string) {
  return consume(`parent-pin-reset-request:user:${userId}`, 3);
}

export function consumePinResetAttemptRateLimit(request: Request) {
  return consume(`parent-pin-reset-attempt:${requestFingerprint(request)}`, 10);
}
