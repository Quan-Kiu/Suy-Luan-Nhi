import { and, desc, eq, gt, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { account, auditLogs, session, user } from "@/db/schema";
import {
  accountSessionAudit,
  accountSessionErrorMessages,
  type AccountSecurityOverview,
  type AccountSignInMethod,
} from "@/domain/account-security";
import { normalizeSessionIpAddress, parseSessionClient } from "@/domain/session-client";

const unknownSignInMethodLabel = "Phương thức khác";

const signInMethodLabels: Record<string, string> = {
  credential: "Mật khẩu",
  google: "Google",
};

function toSignInMethods(providerIds: string[]): AccountSignInMethod[] {
  return [...new Set(providerIds)]
    .map((id) => ({ id, label: signInMethodLabels[id] ?? unknownSignInMethodLabel }))
    .sort((left, right) => left.label.localeCompare(right.label, "vi"));
}

export class CurrentSessionRevocationError extends Error {
  constructor() {
    super(accountSessionErrorMessages.currentSession);
    this.name = "CurrentSessionRevocationError";
  }
}

export async function getAccountSecurityOverview(
  userId: string,
  currentSessionId: string,
): Promise<AccountSecurityOverview | null> {
  const now = new Date();
  const [accountUser, providerRows, sessionRows] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.id, userId) }),
    db.select({ providerId: account.providerId }).from(account).where(eq(account.userId, userId)),
    db
      .select({
        id: session.id,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(and(eq(session.userId, userId), gt(session.expiresAt, now)))
      .orderBy(desc(session.updatedAt)),
  ]);
  if (!accountUser) return null;

  const sessions = sessionRows
    .map((row) => ({
      id: row.id,
      current: row.id === currentSessionId,
      ...parseSessionClient(row.userAgent),
      ipAddress: normalizeSessionIpAddress(row.ipAddress),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
    }))
    .sort(
      (left, right) =>
        Number(right.current) - Number(left.current) || right.updatedAt.localeCompare(left.updatedAt),
    );

  return {
    account: {
      name: accountUser.name,
      email: accountUser.email,
      emailVerified: accountUser.emailVerified,
      twoFactorEnabled: accountUser.twoFactorEnabled,
      createdAt: accountUser.createdAt.toISOString(),
      signInMethods: toSignInMethods(providerRows.map((row) => row.providerId)),
    },
    sessions,
  };
}

export async function revokeAccountSession(
  userId: string,
  currentSessionId: string,
  targetSessionId: string,
) {
  return db.transaction(async (tx) => {
    const [target] = await tx
      .select({ id: session.id, createdAt: session.createdAt, expiresAt: session.expiresAt })
      .from(session)
      .where(and(eq(session.id, targetSessionId), eq(session.userId, userId)))
      .limit(1);
    if (!target) return null;
    if (target.id === currentSessionId) throw new CurrentSessionRevocationError();

    const [revoked] = await tx
      .delete(session)
      .where(
        and(eq(session.id, targetSessionId), eq(session.userId, userId), ne(session.id, currentSessionId)),
      )
      .returning({ id: session.id });
    if (!revoked) return null;

    await tx.insert(auditLogs).values({
      actorId: userId,
      action: accountSessionAudit.actions.revoked,
      resourceType: accountSessionAudit.resourceType,
      resourceId: revoked.id,
      beforeState: { createdAt: target.createdAt.toISOString(), expiresAt: target.expiresAt.toISOString() },
      metadata: { source: accountSessionAudit.source },
    });
    return revoked;
  });
}

export async function revokeOtherAccountSessions(userId: string, currentSessionId: string) {
  return db.transaction(async (tx) => {
    const revoked = await tx
      .delete(session)
      .where(and(eq(session.userId, userId), ne(session.id, currentSessionId)))
      .returning({ id: session.id });

    if (revoked.length) {
      await tx.insert(auditLogs).values({
        actorId: userId,
        action: accountSessionAudit.actions.revokedOthers,
        resourceType: accountSessionAudit.resourceType,
        resourceId: currentSessionId,
        metadata: { source: accountSessionAudit.source, revokedCount: revoked.length },
      });
    }
    return { revokedCount: revoked.length };
  });
}
