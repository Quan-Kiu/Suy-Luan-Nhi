import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimit } from "@/db/schema";

const windowMs = 10 * 60 * 1000;
const maxRequests = 20;

export async function consumeAutomaticErrorReportRateLimit(userId: string) {
  const key = `automatic-error-report:user:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;
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
    allowed: (entry?.count ?? maxRequests + 1) <= maxRequests,
    maxRequests,
    windowMinutes: windowMs / 60_000,
  };
}
