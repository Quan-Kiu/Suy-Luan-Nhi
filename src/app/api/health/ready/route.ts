import { apiJson } from "@/lib/api-response";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return apiJson({
      status: "ready",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return apiJson({ status: "not_ready", database: "unavailable" }, { status: 503 });
  }
}
