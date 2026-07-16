import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { getExportPackage } from "@/modules/family/family";

export async function GET(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const { requestId } = await params;
  const data = await getExportPackage(authResult.session.user.id, requestId);
  if (!data) {
    return apiJson({ message: "Gói dữ liệu không tồn tại hoặc đã hết hạn" }, { status: 404 });
  }
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="suy-luan-nhi-export-${requestId}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
