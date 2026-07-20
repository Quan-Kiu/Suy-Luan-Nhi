import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { deleteMedia } from "@/modules/media/media";
import { resolveMcpActor } from "@/modules/mcp/actor";
import { getMcpHttpConfig } from "@/modules/mcp/config";

async function main() {
  const config = getMcpHttpConfig();
  const transport = new StreamableHTTPClientTransport(
    new URL(`http://${config.MCP_HOST}:${config.MCP_PORT}/mcp`),
    { requestInit: { headers: { Authorization: `Bearer ${config.MCP_API_TOKEN}` } } },
  );
  const client = new Client({ name: "sln-mcp-write-smoke", version: "0.1.0" });
  await client.connect(transport);

  const result = await client.callTool({
    name: "media_upload",
    arguments: {
      fileData:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2ZQAAAABJRU5ErkJggg==",
      fileName: "mcp-write-smoke.png",
      mimeType: "image/png",
      altText: "Điểm ảnh kiểm thử upload thật qua MCP",
      category: "general",
      dryRun: false,
    },
  });
  const callResult = result as {
    isError?: boolean;
    content?: Array<{ type: string; text?: string }>;
  };
  if (callResult.isError || !callResult.content) throw new Error("MCP media upload failed");
  const text = callResult.content.find((item) => item.type === "text" && item.text);
  if (!text?.text) throw new Error("MCP upload returned no JSON payload");
  const asset = JSON.parse(text.text) as {
    id: string;
    url: string;
    storageProvider: string;
    storageKey?: string;
    storageMetadata?: unknown;
  };
  const actor = await resolveMcpActor(config.MCP_ACTOR_EMAIL);
  const cleaned = await deleteMedia(asset.id, actor.id);
  console.log(
    JSON.stringify(
      {
        uploaded: true,
        url: asset.url,
        storageProvider: asset.storageProvider,
        internalStorageFieldsRedacted: !asset.storageKey && !asset.storageMetadata,
        cleaned,
      },
      null,
      2,
    ),
  );

  await transport.terminateSession();
  await client.close();
}

void main().catch((error) => {
  console.error("[sln-mcp] write smoke test failed", error);
  process.exit(1);
});
