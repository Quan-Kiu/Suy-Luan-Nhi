import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt, like, sql } from "drizzle-orm";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { auditLogs, parentProfiles, verification } from "@/db/schema";
import { sendTransactionalEmail } from "@/email/mailer";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { hashPin } from "@/modules/family/pin";

const RESET_PREFIX = "parent-pin-reset:";
const RESET_TTL_MS = 15 * 60 * 1000;

function resetIdentifier(token: string) {
  const digest = createHash("sha256").update(token).digest("hex");
  return `${RESET_PREFIX}${digest}`;
}

export class ParentPinNotConfiguredError extends Error {
  constructor() {
    super("Tài khoản chưa có mã PIN để khôi phục");
    this.name = "ParentPinNotConfiguredError";
  }
}

export class InvalidParentPinResetTokenError extends Error {
  constructor() {
    super("Liên kết đặt lại mã PIN không hợp lệ hoặc đã hết hạn");
    this.name = "InvalidParentPinResetTokenError";
  }
}

export async function requestParentPinReset(input: { userId: string; parentName: string; email: string }) {
  const parent = await getOrCreateParentProfile(input.userId, input.parentName);
  if (!parent.pinHash) throw new ParentPinNotConfiguredError();

  const token = randomBytes(32).toString("base64url");
  const identifier = resetIdentifier(token);
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`${RESET_PREFIX}${input.userId}`}))`);
    await tx
      .delete(verification)
      .where(and(like(verification.identifier, `${RESET_PREFIX}%`), eq(verification.value, input.userId)));
    await tx.insert(verification).values({
      id: randomUUID(),
      identifier,
      value: input.userId,
      expiresAt,
    });
    await tx.insert(auditLogs).values({
      actorId: input.userId,
      action: "parent.pin_reset_requested",
      resourceType: "parent_profile",
      resourceId: parent.id,
      metadata: { expiresAt: expiresAt.toISOString() },
    });
  });

  const resetUrl = new URL("/auth/reset-pin", env.BETTER_AUTH_URL);
  resetUrl.searchParams.set("token", token);
  try {
    await sendTransactionalEmail({
      to: input.email,
      subject: "Đặt lại mã PIN phụ huynh",
      heading: "Tạo mã PIN phụ huynh mới",
      body: "Ba/mẹ đã yêu cầu đặt lại mã PIN. Liên kết này có hiệu lực trong 15 phút và chỉ dùng được một lần.",
      actionLabel: "Đặt lại mã PIN",
      actionUrl: resetUrl.toString(),
    });
  } catch (error) {
    await db.delete(verification).where(eq(verification.identifier, identifier));
    throw error;
  }
}

export async function resetParentPin(token: string, pin: string) {
  const identifier = resetIdentifier(token);
  const existing = await db.query.verification.findFirst({
    where: and(eq(verification.identifier, identifier), gt(verification.expiresAt, new Date())),
  });
  if (!existing) throw new InvalidParentPinResetTokenError();

  const pinHash = await hashPin(pin);
  return db.transaction(async (tx) => {
    const [consumed] = await tx
      .delete(verification)
      .where(and(eq(verification.identifier, identifier), gt(verification.expiresAt, new Date())))
      .returning({ userId: verification.value });
    if (!consumed) throw new InvalidParentPinResetTokenError();

    const parent = await tx.query.parentProfiles.findFirst({
      where: eq(parentProfiles.userId, consumed.userId),
    });
    if (!parent?.pinHash) throw new InvalidParentPinResetTokenError();

    const [updated] = await tx
      .update(parentProfiles)
      .set({
        pinHash,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(parentProfiles.id, parent.id))
      .returning();
    if (!updated) throw new InvalidParentPinResetTokenError();

    await tx
      .delete(verification)
      .where(and(like(verification.identifier, `${RESET_PREFIX}%`), eq(verification.value, consumed.userId)));
    await tx.insert(auditLogs).values({
      actorId: consumed.userId,
      action: "parent.pin_reset_completed",
      resourceType: "parent_profile",
      resourceId: parent.id,
      beforeState: { ...parent, pinHash: "[redacted]" },
      afterState: { ...updated, pinHash: "[redacted]" },
    });
    return updated;
  });
}
