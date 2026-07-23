import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

const verificationPaths = new Set(["/two-factor/verify-totp", "/two-factor/verify-backup-code"]);

export type MfaSessionEnvelope = {
  session: {
    token: string;
    mfaVerifiedAt?: Date | null;
    [key: string]: unknown;
  };
};

export async function markSessionMfaVerified(
  authSession: MfaSessionEnvelope | null,
  updateSession: (token: string, data: { mfaVerifiedAt: Date }) => Promise<unknown>,
  now = new Date(),
) {
  if (!authSession) return false;
  const updated = await updateSession(authSession.session.token, { mfaVerifiedAt: now });
  if (!updated) return false;
  authSession.session.mfaVerifiedAt = now;
  return true;
}

export const staffMfaSessionMarker = {
  id: "staff-mfa-session-marker",
  hooks: {
    after: [
      {
        matcher: (context) => verificationPaths.has(context.path ?? ""),
        handler: createAuthMiddleware(async (context) => {
          await markSessionMfaVerified(context.context.newSession ?? context.context.session, (token, data) =>
            context.context.internalAdapter.updateSession(token, data),
          );
        }),
      },
    ],
  },
} satisfies BetterAuthPlugin;
