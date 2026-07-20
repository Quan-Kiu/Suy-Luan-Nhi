import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function toolResult(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : "MCP tool failed";
  console.error("[sln-mcp] tool error", error);
  return {
    isError: true,
    content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }],
  };
}

export function runTool<T>(handler: () => Promise<T>): Promise<CallToolResult> {
  return handler().then(toolResult).catch(toolError);
}
