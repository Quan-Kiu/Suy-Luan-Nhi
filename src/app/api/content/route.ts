import { apiJson } from "@/lib/api-response";
import { getContentNamespace } from "@/modules/content/content";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const namespace = url.searchParams.get("namespace")?.trim();
  const locale = url.searchParams.get("locale")?.trim() || "vi";
  if (!namespace) {
    return apiJson(
      { code: "CONTENT_NAMESPACE_REQUIRED", message: "Thiếu namespace nội dung" },
      { status: 400 },
    );
  }
  return apiJson(await getContentNamespace(namespace, locale));
}
