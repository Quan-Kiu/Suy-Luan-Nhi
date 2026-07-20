import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { SlnMcpContext } from "@/modules/mcp/context";
import { registerMediaTools } from "@/modules/mcp/tools/media-tools";
import { registerMissionTools } from "@/modules/mcp/tools/mission-tools";
import { registerResourceTools } from "@/modules/mcp/tools/resource-tools";
import { registerSystemTools } from "@/modules/mcp/tools/system-tools";
import { registerTaxonomyTools } from "@/modules/mcp/tools/taxonomy-tools";

export function createSlnMcpServer(context: SlnMcpContext) {
  const server = new McpServer(
    {
      name: "sln-gpt-gateway",
      title: "Suy Luận Nhí MCP Gateway",
      version: "0.1.0",
      description: "Create and inspect validated Suy Luận Nhí missions, parent resources and media.",
    },
    {
      capabilities: { logging: {} },
      instructions:
        "Read taxonomy before generating content. Prefer dryRun for generated writes. Never claim a mission is published: this gateway only creates or updates drafts.",
    },
  );

  registerSystemTools(server, context);
  registerTaxonomyTools(server);
  registerMissionTools(server, context);
  registerResourceTools(server, context);
  registerMediaTools(server, context);

  server.registerPrompt(
    "author_parent_resource",
    {
      title: "Author a parent resource",
      description:
        "Prepare a safe Vietnamese parent resource before validating it with resource_create dryRun.",
      argsSchema: {
        topic: z.string().min(3),
        ageGroup: z.enum(["6-8", "9-10", "11-12"]),
        format: z.enum(["article", "guide", "activity", "video"]).default("article"),
      },
    },
    async ({ topic, ageGroup, format }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Write a Vietnamese ${format} for parents about "${topic}" for children aged ${ageGroup}. Keep advice supportive, practical, non-diagnostic and free of external links. Then call taxonomy_list and resource_create with dryRun=true.`,
          },
        },
      ],
    }),
  );

  return server;
}
