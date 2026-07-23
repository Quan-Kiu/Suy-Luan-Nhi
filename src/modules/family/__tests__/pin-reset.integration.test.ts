// @vitest-environment node

import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { auditLogs, parentProfiles, user, verification } from "@/db/schema";
import { hashPin, verifyPin } from "@/modules/family/pin";
import { InvalidParentPinResetTokenError, resetParentPin } from "@/modules/family/pin-reset";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("parent PIN reset PostgreSQL integration", () => {
  const userId = randomUUID();
  const token = randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "");
  const identifier = `parent-pin-reset:${createHash("sha256").update(token).digest("hex")}`;

  beforeAll(async () => {
    await db.insert(user).values({
      id: userId,
      name: "PIN Reset Parent",
      email: `pin-reset-${userId}@test.local`,
      emailVerified: true,
      role: "parent",
    });
    await db.insert(parentProfiles).values({
      userId,
      displayName: "PIN Reset Parent",
      pinHash: await hashPin("246824"),
      pinFailedAttempts: 3,
      pinLockedUntil: new Date(Date.now() + 60_000),
    });
    await db.insert(verification).values({
      id: randomUUID(),
      identifier,
      value: userId,
      expiresAt: new Date(Date.now() + 15 * 60_000),
    });
  });

  afterAll(async () => {
    await db.delete(verification).where(eq(verification.value, userId));
    await db.delete(auditLogs).where(eq(auditLogs.actorId, userId));
    await db.delete(user).where(eq(user.id, userId));
  });

  it("consumes the token once, changes the PIN, clears lockout and writes an audit", async () => {
    await resetParentPin(token, "135790");
    const parent = await db.query.parentProfiles.findFirst({ where: eq(parentProfiles.userId, userId) });
    expect(parent?.pinHash && (await verifyPin("135790", parent.pinHash))).toBe(true);
    expect(parent?.pinFailedAttempts).toBe(0);
    expect(parent?.pinLockedUntil).toBeNull();
    expect(
      await db.query.verification.findFirst({ where: eq(verification.identifier, identifier) }),
    ).toBeUndefined();
    const audit = await db.query.auditLogs.findFirst({
      where: and(eq(auditLogs.actorId, userId), eq(auditLogs.action, "parent.pin_reset_completed")),
    });
    expect(audit?.resourceType).toBe("parent_profile");
    await expect(resetParentPin(token, "246813")).rejects.toBeInstanceOf(InvalidParentPinResetTokenError);
  });
});
