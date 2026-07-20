import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getMcpHttpConfig } from "@/modules/mcp/config";

async function main() {
  const config = getMcpHttpConfig();
  const endpoint = new URL(`http://${config.MCP_HOST}:${config.MCP_PORT}/mcp`);
  const transport = new StreamableHTTPClientTransport(endpoint, {
    requestInit: {
      headers: { Authorization: `Bearer ${config.MCP_API_TOKEN}` },
    },
  });
  const client = new Client({ name: "sln-mcp-smoke", version: "0.1.0" });

  await client.connect(transport);
  const tools = await client.listTools();
  const prompts = await client.listPrompts();
  const health = await client.callTool({ name: "system_health", arguments: {} });
  const taxonomy = await client.callTool({ name: "taxonomy_list", arguments: {} });
  const resourceDryRun = await client.callTool({
    name: "resource_create",
    arguments: {
      dryRun: true,
      resource: {
        slug: "mcp-smoke-resource",
        title: "Tài nguyên kiểm thử MCP",
        excerpt: "Nội dung thử nghiệm xác nhận schema tài nguyên hoạt động qua giao thức MCP.",
        content:
          "Đây là nội dung kiểm thử ở chế độ dry-run. Không có bản ghi nào được tạo trong cơ sở dữ liệu.",
        resourceType: "article",
        category: "thinking",
        ageGroups: ["6-8"],
        coverUrl: "/assets/cards/world-card-pattern-forest.png",
        mediaUrl: null,
        sortOrder: 0,
        status: "draft",
      },
    },
  });
  const mediaDryRun = await client.callTool({
    name: "media_upload",
    arguments: {
      dryRun: true,
      fileData:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2ZQAAAABJRU5ErkJggg==",
      fileName: "mcp-smoke.png",
      mimeType: "image/png",
      altText: "Điểm ảnh kiểm thử MCP",
      category: "general",
    },
  });

  console.log(
    JSON.stringify(
      {
        connected: true,
        server: client.getServerVersion(),
        toolCount: tools.tools.length,
        toolNames: tools.tools.map((tool) => tool.name),
        promptNames: prompts.prompts.map((prompt) => prompt.name),
        healthError: Boolean("isError" in health && health.isError),
        taxonomyError: Boolean("isError" in taxonomy && taxonomy.isError),
        resourceDryRunError: Boolean("isError" in resourceDryRun && resourceDryRun.isError),
        mediaDryRunError: Boolean("isError" in mediaDryRun && mediaDryRun.isError),
      },
      null,
      2,
    ),
  );

  await transport.terminateSession();
  await client.close();
}

void main().catch((error) => {
  console.error("[sln-mcp] smoke test failed", error);
  process.exit(1);
});
