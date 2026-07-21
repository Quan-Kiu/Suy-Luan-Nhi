import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimit } from "@/db/schema";

const feedbackWindowMs = 10 * 60 * 1000;
const feedbackMaxRequests = 5;

function anonymousFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  const agent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${address}|${agent}`).digest("hex").slice(0, 32);
}

export async function consumeSystemFeedbackRateLimit(request: Request, userId?: string) {
  const identity = userId ? `user:${userId}` : `anonymous:${anonymousFingerprint(request)}`;
  const key = `system-feedback:${identity}`;
  const now = Date.now();
  const windowStart = now - feedbackWindowMs;
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
  return {
    allowed: (entry?.count ?? feedbackMaxRequests + 1) <= feedbackMaxRequests,
    maxRequests: feedbackMaxRequests,
    windowMinutes: feedbackWindowMs / 60_000,
  };
}
