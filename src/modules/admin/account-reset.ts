import { createHash } from "node:crypto";
import { hashPassword } from "@better-auth/utils/password";
import { and, eq, ne, sql } from "drizzle-orm";
import { auth } from "@/auth/auth";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { account, auditLogs, parentProfiles, rateLimit, session, user } from "@/db/schema";
import type { AdminParentPinResetInput, AdminPasswordResetInput } from "@/domain/admin-account-reset";
import { hashPin } from "@/modules/family/pin";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

type ResetAction =
  | "ADMIN_PASSWORD_RESET_REQUESTED"
  | "ADMIN_TEMP_PASSWORD_SET"
  | "ADMIN_PARENT_PIN_CLEARED"
  | "ADMIN_PARENT_PIN_RESET";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class AdminAccountResetError extends Error {
  constructor(
    readonly code:
      | "TARGET_NOT_FOUND"
      | "SELF_RESET_NOT_ALLOWED"
      | "CREDENTIAL_ACCOUNT_REQUIRED"
      | "PARENT_PROFILE_REQUIRED"
      | "LAST_SUPER_ADMIN"
      | "RATE_LIMITED",
    message: string,
  ) {
    super(message);
    this.name = "AdminAccountResetError";
  }
}

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function idempotencyHash(actorId: string, targetUserId: string, operation: string, key: string) {
  return fingerprint(`${actorId}|${targetUserId}|${operation}|${key}`);
}

async function consumeRateLimit(tx: Transaction, actorId: string, targetUserId: string, operation: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const key = `admin-account-reset:${fingerprint(`${actorId}|${targetUserId}|${operation}`).slice(0, 40)}`;
  const [entry] = await tx
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
  if ((entry?.count ?? RATE_LIMIT_MAX + 1) > RATE_LIMIT_MAX) {
    throw new AdminAccountResetError(
      "RATE_LIMITED",
      "Bạn đã thực hiện quá nhiều thao tác với tài khoản này. Vui lòng thử lại sau.",
    );
  }
}

async function findCompletedOperation(
  tx: Transaction,
  actorId: string,
  targetUserId: string,
  action: ResetAction,
  keyHash: string,
) {
  return tx.query.auditLogs.findFirst({
    where: and(
      eq(auditLogs.actorId, actorId),
      eq(auditLogs.resourceId, targetUserId),
      eq(auditLogs.action, action),
      sql`${auditLogs.metadata}->>'idempotencyKeyHash' = ${keyHash}`,
      sql`${auditLogs.metadata}->>'result' = 'success'`,
    ),
  });
}

async function assertResetTarget(tx: Transaction, actorId: string, targetUserId: string) {
  const target = await tx.query.user.findFirst({ where: eq(user.id, targetUserId) });
  if (!target) {
    throw new AdminAccountResetError("TARGET_NOT_FOUND", "Không tìm thấy tài khoản cần xử lý");
  }
  if (actorId === targetUserId) {
    throw new AdminAccountResetError(
      "SELF_RESET_NOT_ALLOWED",
      "Không thể tự đặt lại thông tin đăng nhập từ màn hình quản trị này",
    );
  }
  return target;
}

async function assertCredentialAccount(tx: Transaction, targetUserId: string) {
  const credential = await tx.query.account.findFirst({
    where: and(eq(account.userId, targetUserId), eq(account.providerId, "credential")),
  });
  if (!credential) {
    throw new AdminAccountResetError(
      "CREDENTIAL_ACCOUNT_REQUIRED",
      "Tài khoản này chỉ đăng nhập bằng Google và cần quản lý mật khẩu qua Google",
    );
  }
  return credential;
}

async function assertNotFinalSuperAdmin(tx: Transaction, target: { role: string; banned: boolean }) {
  if (target.role !== "super_admin" || target.banned) return;
  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(and(eq(user.role, "super_admin"), eq(user.banned, false)));
  if ((row?.count ?? 0) <= 1) {
    throw new AdminAccountResetError(
      "LAST_SUPER_ADMIN",
      "Không thể đặt lại thông tin đăng nhập của quản trị viên cuối cùng",
    );
  }
}

function auditMetadata(input: {
  requestId: string;
  idempotencyKeyHash: string;
  mode: string;
  revokedSessionCount?: number;
}) {
  return {
    result: "success",
    requestId: input.requestId,
    idempotencyKeyHash: input.idempotencyKeyHash,
    mode: input.mode,
    ...(input.revokedSessionCount === undefined ? {} : { revokedSessionCount: input.revokedSessionCount }),
  };
}

export async function resetMemberPassword(input: {
  actorId: string;
  targetUserId: string;
  requestId: string;
  idempotencyKey: string;
  requestHeaders: Headers;
  reset: AdminPasswordResetInput;
}) {
  const action: ResetAction =
    input.reset.mode === "email_link" ? "ADMIN_PASSWORD_RESET_REQUESTED" : "ADMIN_TEMP_PASSWORD_SET";
  const keyHash = idempotencyHash(input.actorId, input.targetUserId, action, input.idempotencyKey);

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`sln:admin-account-reset:${keyHash}`}))`);
    const previous = await findCompletedOperation(tx, input.actorId, input.targetUserId, action, keyHash);
    if (previous) return { accepted: true, duplicate: true, mode: input.reset.mode } as const;

    await consumeRateLimit(tx, input.actorId, input.targetUserId, "password");
    const target = await assertResetTarget(tx, input.actorId, input.targetUserId);
    const credential = await assertCredentialAccount(tx, input.targetUserId);
    await assertNotFinalSuperAdmin(tx, target);

    if (input.reset.mode === "email_link") {
      await auth.api.requestPasswordReset({
        headers: input.requestHeaders,
        body: {
          email: target.email,
          redirectTo: new URL("/auth/reset-password", env.BETTER_AUTH_URL).toString(),
        },
      });
      await tx.insert(auditLogs).values({
        actorId: input.actorId,
        action,
        resourceType: "user",
        resourceId: input.targetUserId,
        metadata: auditMetadata({
          requestId: input.requestId,
          idempotencyKeyHash: keyHash,
          mode: input.reset.mode,
        }),
      });
      return { accepted: true, duplicate: false, mode: input.reset.mode } as const;
    }

    const passwordHash = await hashPassword(input.reset.temporaryPassword);
    const revokedSessions = await tx
      .delete(session)
      .where(eq(session.userId, input.targetUserId))
      .returning({ id: session.id });
    await tx
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(account.id, credential.id));
    await tx
      .update(user)
      .set({ mustChangePassword: true, updatedAt: new Date() })
      .where(eq(user.id, input.targetUserId));
    await tx.insert(auditLogs).values({
      actorId: input.actorId,
      action,
      resourceType: "user",
      resourceId: input.targetUserId,
      metadata: auditMetadata({
        requestId: input.requestId,
        idempotencyKeyHash: keyHash,
        mode: input.reset.mode,
        revokedSessionCount: revokedSessions.length,
      }),
    });
    return {
      accepted: true,
      duplicate: false,
      mode: input.reset.mode,
      revokedSessionCount: revokedSessions.length,
    } as const;
  });
}

export async function resetMemberParentPin(input: {
  actorId: string;
  targetUserId: string;
  requestId: string;
  idempotencyKey: string;
  reset: AdminParentPinResetInput;
}) {
  const action: ResetAction =
    input.reset.mode === "clear" ? "ADMIN_PARENT_PIN_CLEARED" : "ADMIN_PARENT_PIN_RESET";
  const keyHash = idempotencyHash(input.actorId, input.targetUserId, action, input.idempotencyKey);

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`sln:admin-account-reset:${keyHash}`}))`);
    const previous = await findCompletedOperation(tx, input.actorId, input.targetUserId, action, keyHash);
    if (previous) return { accepted: true, duplicate: true, mode: input.reset.mode } as const;

    await consumeRateLimit(tx, input.actorId, input.targetUserId, "pin");
    const target = await assertResetTarget(tx, input.actorId, input.targetUserId);
    if (target.role !== "parent") {
      throw new AdminAccountResetError(
        "PARENT_PROFILE_REQUIRED",
        "Chỉ tài khoản phụ huynh có hồ sơ gia đình mới có mã PIN",
      );
    }
    const parent = await tx.query.parentProfiles.findFirst({
      where: eq(parentProfiles.userId, input.targetUserId),
    });
    if (!parent) {
      throw new AdminAccountResetError(
        "PARENT_PROFILE_REQUIRED",
        "Tài khoản phụ huynh này chưa có hồ sơ gia đình để đặt lại mã PIN",
      );
    }

    const nextPinHash = input.reset.mode === "temporary_pin" ? await hashPin(input.reset.temporaryPin) : null;
    await tx
      .update(parentProfiles)
      .set({
        pinHash: nextPinHash,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(parentProfiles.id, parent.id));
    await tx.insert(auditLogs).values({
      actorId: input.actorId,
      action,
      resourceType: "parent_profile",
      resourceId: input.targetUserId,
      metadata: auditMetadata({
        requestId: input.requestId,
        idempotencyKeyHash: keyHash,
        mode: input.reset.mode,
      }),
    });
    return { accepted: true, duplicate: false, mode: input.reset.mode } as const;
  });
}

export async function completeForcedPasswordChange(input: {
  userId: string;
  currentSessionId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const { verifyPassword } = await import("@better-auth/utils/password");
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`sln:forced-password:${input.userId}`}))`);
    const target = await tx.query.user.findFirst({ where: eq(user.id, input.userId) });
    if (!target?.mustChangePassword) return { changed: false, alreadyCompleted: true } as const;
    const credential = await assertCredentialAccount(tx, input.userId);
    if (!credential.password || !(await verifyPassword(credential.password, input.currentPassword))) {
      throw new Error("INVALID_CURRENT_PASSWORD");
    }
    const nextPasswordHash = await hashPassword(input.newPassword);
    await tx
      .update(account)
      .set({ password: nextPasswordHash, updatedAt: new Date() })
      .where(eq(account.id, credential.id));
    await tx
      .update(user)
      .set({ mustChangePassword: false, updatedAt: new Date() })
      .where(eq(user.id, input.userId));
    const revoked = await tx
      .delete(session)
      .where(and(eq(session.userId, input.userId), ne(session.id, input.currentSessionId)))
      .returning({ id: session.id });
    return { changed: true, alreadyCompleted: false, revokedSessionCount: revoked.length } as const;
  });
}

export async function auditAdminAccountResetFailure(input: {
  actorId: string;
  targetUserId: string;
  action: ResetAction;
  requestId: string;
  code: string;
}) {
  await db.insert(auditLogs).values({
    actorId: input.actorId,
    action: input.action,
    resourceType: "user",
    resourceId: input.targetUserId,
    metadata: { result: "failure", requestId: input.requestId, errorCode: input.code },
  });
}
