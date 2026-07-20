import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { mediaAssets, missions, parentResources } from "@/db/schema";
import { env } from "@/config/env";
import type { SlnMcpContext } from "@/modules/mcp/context";
import { runTool } from "@/modules/mcp/result";

async function count(table: typeof missions | typeof parentResources | typeof mediaAssets) {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(table);
  return rows[0]?.count ?? 0;
}

export function registerSystemTools(server: McpServer, context: SlnMcpContext) {
  server.registerTool(
    "system_health",
    {
      title: "SLN system health",
      description: "Check database readiness, storage mode, gateway actor and aggregate content counts.",
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    () =>
      runTool(async () => {
        await db.execute(sql`select 1`);
        const [missionCount, resourceCount, mediaCount] = await Promise.all([
          count(missions),
          count(parentResources),
          count(mediaAssets),
        ]);
        const memory = process.memoryUsage();
        return {
          status: "ready",
          database: "ok",
          storageProvider: env.STORAGE_DRIVER,
          readOnly: context.config.MCP_READ_ONLY,
          actor: {
            email: context.actor.email,
            name: context.actor.name,
            role: context.actor.role,
          },
          counts: { missions: missionCount, resources: resourceCount, media: mediaCount },
          process: {
            nodeVersion: process.version,
            uptimeSeconds: Math.round(process.uptime()),
            rssBytes: memory.rss,
            heapUsedBytes: memory.heapUsed,
          },
          checkedAt: new Date().toISOString(),
        };
      }),
  );
}
