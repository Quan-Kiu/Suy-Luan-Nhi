import { apiJson } from "@/lib/api-response";
export const dynamic = "force-dynamic";

export function GET() {
  return apiJson({
    status: "ok",
    service: "sln-gpt",
    timestamp: new Date().toISOString(),
  });
}
