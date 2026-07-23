import "server-only";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { account } from "@/db/schema";

export async function hasPasswordCredential(userId: string) {
  const credential = await db.query.account.findFirst({
    columns: { id: true },
    where: and(eq(account.userId, userId), eq(account.providerId, "credential"), isNotNull(account.password)),
  });

  return Boolean(credential);
}
