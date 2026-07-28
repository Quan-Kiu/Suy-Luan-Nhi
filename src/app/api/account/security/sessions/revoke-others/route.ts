import { requireApiParentGate } from "@/auth/api";
import { accountSessionErrorCodes, accountSessionErrorMessages } from "@/domain/account-security";
import { apiJson } from "@/lib/api-response";
import { getAccountSecurityOverview, revokeOtherAccountSessions } from "@/modules/account/session-security";

export async function POST(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const currentSessionId = authResult.session.session.id;
  await revokeOtherAccountSessions(authResult.session.user.id, currentSessionId);
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
