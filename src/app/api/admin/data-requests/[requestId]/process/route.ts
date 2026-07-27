import { apiJson } from "@/lib/api-response";
import { requireApiPermission } from "@/auth/api";
import { processDeleteDataRequest } from "@/modules/admin/operations";

export async function POST(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const authResult = await requireApiPermission(request, "data_requests.manage");
  if ("error" in authResult) return authResult.error;
  const { requestId } = await params;
  const result = await processDeleteDataRequest(authResult.session.user.id, requestId);
  return result
    ? apiJson(result)
    : apiJson({ message: "Yêu cầu xóa không tồn tại hoặc đã được xử lý" }, { status: 409 });
}
