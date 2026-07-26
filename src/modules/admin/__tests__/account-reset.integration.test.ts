// @vitest-environment node

import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "@better-auth/utils/password";
import { and, eq, inArray, like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { auth } from "@/auth/auth";
import { env } from "@/config/env";
import { db, pool } from "@/db/client";
import { account, auditLogs, parentProfiles, rateLimit, session, user, verification } from "@/db/schema";
import {
  completeForcedPasswordChange,
  resetMemberParentPin,
  resetMemberPassword,
} from "@/modules/admin/account-reset";
import { hashPin, verifyPin } from "@/modules/family/pin";
import { sendTransactionalEmail } from "@/email/mailer";

vi.mock("@/email/mailer", () => ({ sendTransactionalEmail: vi.fn() }));

const suite = process.env.RUN_DB_TESTS === "true" ? describe : describe.skip;

suite("admin account reset PostgreSQL integration", () => {
  const actorId = randomUUID();
  const emailTargetId = randomUUID();
  const temporaryTargetId = randomUUID();
  const googleTargetId = randomUUID();
  const parentTargetId = randomUUID();
  const rateLimitTargetId = randomUUID();
  const initialPassword = "Initial-Password-2026";
  const temporaryPassword = "Temporary-Password-2026";
  const finalPassword = "Final-Password-2026";
  const oldPin = "246824";
  const temporaryPin = "135790";

  beforeAll(async () => {
    const initialHash = await hashPassword(initialPassword);
    await db.insert(user).values([
      {
        id: actorId,
        name: "Account Reset Actor",
        email: `reset-actor-${actorId}@test.local`,
        emailVerified: true,
        role: "super_admin",
      },
      {
        id: emailTargetId,
        name: "Email Reset Target",
        email: `reset-email-${emailTargetId}@test.local`,
        emailVerified: true,
        role: "parent",
        mustChangePassword: true,
      },
      {
        id: temporaryTargetId,
        name: "Temporary Password Target",
        email: `reset-temp-${temporaryTargetId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
      {
        id: googleTargetId,
        name: "Google Only Target",
        email: `reset-google-${googleTargetId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
      {
        id: parentTargetId,
        name: "Parent PIN Target",
        email: `reset-pin-${parentTargetId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
      {
        id: rateLimitTargetId,
        name: "Rate Limit PIN Target",
        email: `reset-rate-${rateLimitTargetId}@test.local`,
        emailVerified: true,
        role: "parent",
      },
    ]);
    await db.insert(account).values([
      {
        id: randomUUID(),
        accountId: emailTargetId,
        providerId: "credential",
        userId: emailTargetId,
        password: initialHash,
      },
      {
        id: randomUUID(),
        accountId: temporaryTargetId,
        providerId: "credential",
        userId: temporaryTargetId,
        password: initialHash,
      },
      {
        id: randomUUID(),
        accountId: googleTargetId,
        providerId: "google",
        userId: googleTargetId,
      },
    ]);
    await db.insert(parentProfiles).values([
      {
        userId: parentTargetId,
        displayName: "Parent PIN Target",
        pinHash: await hashPin(oldPin),
        pinFailedAttempts: 4,
        pinLockedUntil: new Date(Date.now() + 60_000),
      },
      {
        userId: rateLimitTargetId,
        displayName: "Rate Limit PIN Target",
        pinHash: await hashPin(oldPin),
      },
    ]);
    await db.insert(session).values([
      {
        id: randomUUID(),
        token: randomUUID(),
        userId: emailTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
      {
        id: randomUUID(),
        token: randomUUID(),
        userId: temporaryTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
      {
        id: randomUUID(),
        token: randomUUID(),
        userId: temporaryTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
  });

  afterAll(async () => {
    await db
      .delete(auditLogs)
      .where(
        inArray(auditLogs.resourceId, [emailTargetId, temporaryTargetId, googleTargetId, parentTargetId]),
      );
    await db
      .delete(verification)
      .where(inArray(verification.value, [emailTargetId, temporaryTargetId, googleTargetId, parentTargetId]));
    await db.delete(rateLimit).where(like(rateLimit.key, "admin-account-reset:%"));
    await db.delete(user).where(eq(user.id, rateLimitTargetId));
    await db.delete(user).where(eq(user.id, parentTargetId));
    await db.delete(user).where(eq(user.id, googleTargetId));
    await db.delete(user).where(eq(user.id, temporaryTargetId));
    await db.delete(user).where(eq(user.id, emailTargetId));
    await db.delete(user).where(eq(user.id, actorId));
    await pool.end();
  });

  it("creates a one-time reset token, audits the request, and revokes sessions after password reset", async () => {
    const requestId = randomUUID();
    const result = await resetMemberPassword({
      actorId,
      targetUserId: emailTargetId,
      requestId,
      idempotencyKey: "email-reset-integration-key",
      requestHeaders: new Headers({ origin: new URL(env.BETTER_AUTH_URL).origin }),
      reset: { mode: "email_link" },
    });
    expect(result).toMatchObject({ accepted: true, duplicate: false, mode: "email_link" });
    expect(sendTransactionalEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: `reset-email-${emailTargetId}@test.local`,
        actionUrl: expect.stringContaining("/reset-password/"),
      }),
    );

    const tokenRow = await db.query.verification.findFirst({
      where: and(like(verification.identifier, "reset-password:%"), eq(verification.value, emailTargetId)),
    });
    expect(tokenRow).toBeTruthy();
    const token = tokenRow!.identifier.replace("reset-password:", "");

    await auth.api.resetPassword({ body: { token, newPassword: finalPassword } });
    await expect(
      auth.api.resetPassword({ body: { token, newPassword: finalPassword } }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });

    const remainingSessions = await db.select().from(session).where(eq(session.userId, emailTargetId));
    expect(remainingSessions).toHaveLength(0);
    const updatedUser = await db.query.user.findFirst({ where: eq(user.id, emailTargetId) });
    expect(updatedUser?.mustChangePassword).toBe(false);
    const credential = await db.query.account.findFirst({
      where: and(eq(account.userId, emailTargetId), eq(account.providerId, "credential")),
    });
    expect(await verifyPassword(credential!.password!, finalPassword)).toBe(true);

    const audit = await db.query.auditLogs.findFirst({
      where: and(
        eq(auditLogs.resourceId, emailTargetId),
        eq(auditLogs.action, "ADMIN_PASSWORD_RESET_REQUESTED"),
      ),
    });
    expect(audit?.metadata).toMatchObject({ result: "success", requestId, mode: "email_link" });
    expect(JSON.stringify(audit)).not.toContain(token);
  });

  it("sets a temporary password once, revokes sessions, and forces a safe password change", async () => {
    const operation = {
      actorId,
      targetUserId: temporaryTargetId,
      requestId: randomUUID(),
      idempotencyKey: "temporary-password-integration-key",
      requestHeaders: new Headers(),
      reset: { mode: "temporary_password", temporaryPassword } as const,
    };
    const first = await resetMemberPassword(operation);
    const duplicate = await resetMemberPassword(operation);
    expect(first).toMatchObject({ duplicate: false, revokedSessionCount: 2 });
    expect(duplicate).toMatchObject({ duplicate: true });

    const target = await db.query.user.findFirst({ where: eq(user.id, temporaryTargetId) });
    expect(target?.mustChangePassword).toBe(true);
    expect(await db.select().from(session).where(eq(session.userId, temporaryTargetId))).toHaveLength(0);
    const credential = await db.query.account.findFirst({
      where: and(eq(account.userId, temporaryTargetId), eq(account.providerId, "credential")),
    });
    expect(await verifyPassword(credential!.password!, temporaryPassword)).toBe(true);

    const currentSessionId = randomUUID();
    const otherSessionId = randomUUID();
    await db.insert(session).values([
      {
        id: currentSessionId,
        token: randomUUID(),
        userId: temporaryTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
      {
        id: otherSessionId,
        token: randomUUID(),
        userId: temporaryTargetId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    ]);
    const changed = await completeForcedPasswordChange({
      userId: temporaryTargetId,
      currentSessionId,
      currentPassword: temporaryPassword,
      newPassword: finalPassword,
    });
    expect(changed).toMatchObject({ changed: true, revokedSessionCount: 1 });
    expect(await db.select().from(session).where(eq(session.userId, temporaryTargetId))).toMatchObject([
      { id: currentSessionId },
    ]);
    const changedUser = await db.query.user.findFirst({ where: eq(user.id, temporaryTargetId) });
    expect(changedUser?.mustChangePassword).toBe(false);
    const changedCredential = await db.query.account.findFirst({
      where: and(eq(account.userId, temporaryTargetId), eq(account.providerId, "credential")),
    });
    expect(await verifyPassword(changedCredential!.password!, finalPassword)).toBe(true);

    const audits = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.resourceId, temporaryTargetId),
        eq(auditLogs.action, "ADMIN_TEMP_PASSWORD_SET"),
      ),
    });
    expect(audits).toHaveLength(1);
    expect(JSON.stringify(audits)).not.toContain(temporaryPassword);
  });

  it("rejects self-reset and Google-only password reset at the server boundary", async () => {
    await expect(
      resetMemberPassword({
        actorId,
        targetUserId: actorId,
        requestId: randomUUID(),
        idempotencyKey: "self-reset-integration-key",
        requestHeaders: new Headers(),
        reset: { mode: "temporary_password", temporaryPassword },
      }),
    ).rejects.toMatchObject({ code: "SELF_RESET_NOT_ALLOWED" });

    await expect(
      resetMemberPassword({
        actorId,
        targetUserId: googleTargetId,
        requestId: randomUUID(),
        idempotencyKey: "google-reset-integration-key",
        requestHeaders: new Headers(),
        reset: { mode: "temporary_password", temporaryPassword },
      }),
    ).rejects.toMatchObject({ code: "CREDENTIAL_ACCOUNT_REQUIRED" });
  });

  it("replaces or clears the parent PIN without exposing it in audit data", async () => {
    const resetResult = await resetMemberParentPin({
      actorId,
      targetUserId: parentTargetId,
      requestId: randomUUID(),
      idempotencyKey: "parent-pin-temp-integration-key",
      reset: { mode: "temporary_pin", temporaryPin },
    });
    expect(resetResult).toMatchObject({ duplicate: false, mode: "temporary_pin" });

    let parent = await db.query.parentProfiles.findFirst({
      where: eq(parentProfiles.userId, parentTargetId),
    });
    expect(parent?.pinFailedAttempts).toBe(0);
    expect(parent?.pinLockedUntil).toBeNull();
    expect(await verifyPin(oldPin, parent!.pinHash!)).toBe(false);
    expect(await verifyPin(temporaryPin, parent!.pinHash!)).toBe(true);

    await resetMemberParentPin({
      actorId,
      targetUserId: parentTargetId,
      requestId: randomUUID(),
      idempotencyKey: "parent-pin-clear-integration-key",
      reset: { mode: "clear" },
    });
    parent = await db.query.parentProfiles.findFirst({ where: eq(parentProfiles.userId, parentTargetId) });
    expect(parent?.pinHash).toBeNull();

    const audits = await db.query.auditLogs.findMany({
      where: eq(auditLogs.resourceId, parentTargetId),
    });
    expect(audits.map((item) => item.action)).toEqual(
      expect.arrayContaining(["ADMIN_PARENT_PIN_RESET", "ADMIN_PARENT_PIN_CLEARED"]),
    );
    expect(JSON.stringify(audits)).not.toContain(temporaryPin);
    expect(JSON.stringify(audits)).not.toContain(oldPin);
  });
  it("rate limits repeated reset attempts for the same actor and target", async () => {
    for (let index = 0; index < 5; index += 1) {
      await expect(
        resetMemberParentPin({
          actorId,
          targetUserId: rateLimitTargetId,
          requestId: randomUUID(),
          idempotencyKey: `rate-limit-parent-pin-${index}`,
          reset: { mode: "clear" },
        }),
      ).resolves.toMatchObject({ accepted: true });
    }

    await expect(
      resetMemberParentPin({
        actorId,
        targetUserId: rateLimitTargetId,
        requestId: randomUUID(),
        idempotencyKey: "rate-limit-parent-pin-blocked",
        reset: { mode: "clear" },
      }),
    ).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });
});
