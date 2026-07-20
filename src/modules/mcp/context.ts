import type { McpActor } from "@/modules/mcp/actor";
import type { McpBaseConfig } from "@/modules/mcp/config";

export type SlnMcpContext = {
  actor: McpActor;
  config: McpBaseConfig;
};

export function assertMcpWritable(context: SlnMcpContext) {
  if (context.config.MCP_READ_ONLY) {
    throw new Error("MCP gateway is running in read-only mode");
  }
}
