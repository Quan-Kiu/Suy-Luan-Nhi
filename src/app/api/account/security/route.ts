import { requireApiParentGate } from "@/auth/api";
import { accountSessionErrorCodes, accountSessionErrorMessages } from "@/domain/account-security";
import { apiJson } from "@/lib/api-response";
import { getAccountSecurityOverview } from "@/modules/account/session-security";

export async function GET(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const overview = await getAccountSecurityOverview(
    authResult.session.user.id,
    authResult.session.session.id,
  );
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
