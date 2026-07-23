// @vitest-environment node

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { auth } from "@/auth/auth";
import { db, pool } from "@/db/client";
import { auditLogs, session, user } from "@/db/schema";
import { updateMember } from "@/modules/admin/operations";

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("member ban security PostgreSQL integration", () => {
  const actorId = randomUUID();
  const targetId = randomUUID();

  beforeAll(async () => {
    await db.insert(user).values([
      {
        id: actorId,
        name: "Security Test Actor",
        email: `security-actor-${actorId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
      {
        id: targetId,
        name: "Security Test Target",
        email: `security-target-${targetId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
    ]);
    await db.insert(session).values([
      {
        id: randomUUID(),
        token: randomUUID(),
        userId: targetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
      {
        id: randomUUID(),
        token: randomUUID(),
        userId: targetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(auditLogs).where(eq(auditLogs.resourceId, targetId));
    await db.delete(user).where(eq(user.id, targetId));
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("revokes existing sessions and audits the revocation in the same operation", async () => {
    const updated = await updateMember(actorId, targetId, {
      banned: true,
      banReason: "Integration security test",
    });
    expect(updated?.banned).toBe(true);

    const remainingSessions = await db.select().from(session).where(eq(session.userId, targetId));
    expect(remainingSessions).toHaveLength(0);

    const revokeAudit = await db.query.auditLogs.findFirst({
      where: and(eq(auditLogs.resourceId, targetId), eq(auditLogs.action, "session.revoked_by_ban")),
    });
    expect(revokeAudit?.metadata).toMatchObject({ revokedSessionCount: 2 });
  });

  it("blocks credential sign-in for a banned account", async () => {
    await expect(
      auth.api.signInEmail({
        body: {
          email: `security-target-${targetId}@test.local`,
          password: "irrelevant-password",
        },
      }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects new sessions for a banned account at the database boundary", async () => {
    await expect(
      db.insert(session).values({
        id: randomUUID(),
        token: randomUUID(),
        userId: targetId,
        expiresAt: new Date(Date.now() + 60_000),
      }),
    ).rejects.toMatchObject({
      cause: expect.objectContaining({ message: expect.stringContaining("ACCOUNT_BANNED") }),
    });
  });

  it("revokes sessions when an active ban is written directly in the database", async () => {
    const client = await pool.connect();
    const directUserId = randomUUID();
    try {
      await client.query("begin");
      await client.query(
        'insert into "user" (id, name, email, email_verified, role, banned) values ($1, $2, $3, true, $4, false)',
        [directUserId, "Direct Ban Target", `direct-ban-${directUserId}@test.local`, "parent"],
      );
      await client.query(
        'insert into "session" (id, token, user_id, expires_at, created_at, updated_at) values ($1, $2, $3, $4, now(), now())',
        [randomUUID(), randomUUID(), directUserId, new Date(Date.now() + 60_000)],
      );
      await client.query('update "user" set banned = true where id = $1', [directUserId]);
      const result = await client.query<{ count: string }>(
        'select count(*)::text as count from "session" where user_id = $1',
        [directUserId],
      );
      expect(result.rows[0]?.count).toBe("0");
    } finally {
      await client.query("rollback");
      client.release();
    }
  });

  it("protects the final active super admin at the database boundary", async () => {
    const client = await pool.connect();
    const protectedId = randomUUID();
    try {
      await client.query("begin");
      await client.query(
        'insert into "user" (id, name, email, email_verified, role, banned) values ($1, $2, $3, true, $4, false)',
        [protectedId, "Protected Super Admin", `protected-${protectedId}@test.local`, "super_admin"],
      );
      await client.query('update "user" set banned = true where role = $1 and id <> $2 and banned = false', [
        "super_admin",
        protectedId,
      ]);
      await expect(
        client.query('update "user" set role = $1 where id = $2', ["reviewer", protectedId]),
      ).rejects.toMatchObject({
        message: expect.stringContaining("LAST_SUPER_ADMIN"),
      });
    } finally {
      await client.query("rollback");
      client.release();
    }
  });
});
