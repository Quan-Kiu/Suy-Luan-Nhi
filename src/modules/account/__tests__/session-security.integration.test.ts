// @vitest-environment node

import { randomUUID } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db, pool } from "@/db/client";
import { account, auditLogs, session, user } from "@/db/schema";
import { accountSessionAudit } from "@/domain/account-security";
import {
  CurrentSessionRevocationError,
  getAccountSecurityOverview,
  revokeAccountSession,
  revokeOtherAccountSessions,
} from "@/modules/account/session-security";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("account session security PostgreSQL integration", () => {
  const userId = randomUUID();
  const otherUserId = randomUUID();
  const currentSessionId = randomUUID();
  const secondSessionId = randomUUID();
  const thirdSessionId = randomUUID();
  const foreignSessionId = randomUUID();
  const suffix = randomUUID().slice(0, 8);
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  beforeAll(async () => {
    await db.insert(user).values([
      {
        id: userId,
        name: "Parent Session Owner",
        email: `session-owner-${suffix}@test.local`,
        emailVerified: true,
        role: "parent",
      },
      {
        id: otherUserId,
        name: "Other Parent",
        email: `other-session-owner-${suffix}@test.local`,
        emailVerified: true,
        role: "parent",
      },
    ]);
    await db.insert(account).values([
      { id: randomUUID(), accountId: userId, providerId: "credential", userId },
      { id: randomUUID(), accountId: userId, providerId: "google", userId },
    ]);
    await db.insert(session).values([
      {
        id: currentSessionId,
        token: `current-${suffix}`,
        userId,
        expiresAt: future,
        ipAddress: "::ffff:127.0.0.1",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36",
      },
      {
        id: secondSessionId,
        token: `second-${suffix}`,
        userId,
        expiresAt: future,
        ipAddress: "10.0.0.2",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Mobile Safari/604.1",
      },
      {
        id: thirdSessionId,
        token: `third-${suffix}`,
        userId,
        expiresAt: future,
        ipAddress: "10.0.0.3",
        userAgent: null,
      },
      {
        id: foreignSessionId,
        token: `foreign-${suffix}`,
        userId: otherUserId,
        expiresAt: future,
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(auditLogs).where(eq(auditLogs.actorId, userId));
    await db.delete(session).where(inArray(session.userId, [userId, otherUserId]));
    await db.delete(account).where(eq(account.userId, userId));
    await db.delete(user).where(inArray(user.id, [userId, otherUserId]));
    await pool.end();
  });

  it("returns only active sessions owned by the account without exposing tokens", async () => {
    const overview = await getAccountSecurityOverview(userId, currentSessionId);
    expect(overview?.account.signInMethods.map((item) => item.label)).toEqual(["Google", "Mật khẩu"]);
    expect(overview?.sessions).toHaveLength(3);
    expect(overview?.sessions[0]).toMatchObject({
      id: currentSessionId,
      current: true,
      browser: "Chrome",
      operatingSystem: "Linux",
      ipAddress: "127.0.0.1",
    });
    expect(JSON.stringify(overview)).not.toContain(`current-${suffix}`);
    expect(overview?.sessions.some((item) => item.id === foreignSessionId)).toBe(false);
  });

  it("rejects current and foreign session revocation while auditing an owned revoke", async () => {
    await expect(revokeAccountSession(userId, currentSessionId, currentSessionId)).rejects.toBeInstanceOf(
      CurrentSessionRevocationError,
    );
    await expect(revokeAccountSession(userId, currentSessionId, foreignSessionId)).resolves.toBeNull();
    await expect(revokeAccountSession(userId, currentSessionId, secondSessionId)).resolves.toEqual({
      id: secondSessionId,
    });

    expect(await db.query.session.findFirst({ where: eq(session.id, currentSessionId) })).toBeTruthy();
    expect(await db.query.session.findFirst({ where: eq(session.id, secondSessionId) })).toBeUndefined();
    expect(
      await db.query.auditLogs.findFirst({
        where: and(eq(auditLogs.actorId, userId), eq(auditLogs.resourceId, secondSessionId)),
      }),
    ).toMatchObject({
      action: accountSessionAudit.actions.revoked,
      resourceType: accountSessionAudit.resourceType,
    });
  });

  it("revokes every other owned session and preserves the current session", async () => {
    await expect(revokeOtherAccountSessions(userId, currentSessionId)).resolves.toEqual({ revokedCount: 1 });
    const remaining = await db.select({ id: session.id }).from(session).where(eq(session.userId, userId));
    expect(remaining).toEqual([{ id: currentSessionId }]);
    const audit = await db.query.auditLogs.findFirst({
      where: and(
        eq(auditLogs.actorId, userId),
        eq(auditLogs.action, accountSessionAudit.actions.revokedOthers),
      ),
    });
    expect(audit?.metadata).toMatchObject({ revokedCount: 1, source: accountSessionAudit.source });
  });
});
