import { requireApiParentGate } from "@/auth/api";
import { accountSessionErrorCodes, accountSessionErrorMessages } from "@/domain/account-security";
import { apiJson } from "@/lib/api-response";
import {
  CurrentSessionRevocationError,
  getAccountSecurityOverview,
  revokeAccountSession,
} from "@/modules/account/session-security";

type Context = { params: Promise<{ sessionId: string }> };

export async function DELETE(request: Request, context: Context) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const { sessionId } = await context.params;
  const currentSessionId = authResult.session.session.id;

  try {
    const revoked = await revokeAccountSession(authResult.session.user.id, currentSessionId, sessionId);
    if (!revoked) {
      return apiJson(
        { code: accountSessionErrorCodes.notFound, message: accountSessionErrorMessages.notFound },
        { status: 404 },
      );
    }
  } catch (error) {
    if (error instanceof CurrentSessionRevocationError) {
      return apiJson(
        {
          code: accountSessionErrorCodes.currentSession,
          message: accountSessionErrorMessages.currentSession,
        },
        { status: 409 },
      );
    }
    throw error;
  }

  const overview = await getAccountSecurityOverview(authResult.session.user.id, currentSessionId);
  return overview
    ? apiJson(overview)
    : apiJson(
        {
          code: accountSessionErrorCodes.accountNotFound,
          message: accountSessionErrorMessages.accountNotFound,
        },
        { status: 404 },
      );
}
