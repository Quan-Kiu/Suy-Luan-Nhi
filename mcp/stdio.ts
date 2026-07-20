import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { pool } from "@/db/client";
import { resolveMcpActor } from "@/modules/mcp/actor";
import { getMcpBaseConfig } from "@/modules/mcp/config";
import { createSlnMcpServer } from "@/modules/mcp/server";

async function main() {
  const config = getMcpBaseConfig();
  const actor = await resolveMcpActor(config.MCP_ACTOR_EMAIL);
  const server = createSlnMcpServer({ actor, config });
  const transport = new StdioServerTransport();
  await server.connect(transport);

  async function shutdown() {
    await server.close().catch(() => undefined);
    await pool.end();
    process.exit(0);
  }

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

void main().catch((error) => {
  console.error("[sln-mcp] stdio startup failed", error);
  process.exit(1);
});
