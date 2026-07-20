import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mediaCategories } from "@/domain/media";
import { listMedia, uploadMedia } from "@/modules/media/media";
import { validateMedia } from "@/modules/media/storage/validation";
import { assertMcpWritable, type SlnMcpContext } from "@/modules/mcp/context";
import { fileFromBase64, fileFromRemoteUrl } from "@/modules/mcp/remote-file";
import { runTool } from "@/modules/mcp/result";

const uploadInput = z.object({
  sourceUrl: z.string().url().optional(),
  fileData: z.string().min(4).optional(),
  fileName: z.string().trim().min(1).max(120),
  mimeType: z.string().trim().min(3).optional(),
  altText: z.string().trim().min(3).max(500),
  category: z.enum(mediaCategories),
  dryRun: z.boolean().default(false),
});

type UploadedMedia = Awaited<ReturnType<typeof uploadMedia>>;

function publicMediaAsset(asset: UploadedMedia) {
  return {
    id: asset.id,
    type: asset.type,
    storageProvider: asset.storageProvider,
    category: asset.category,
    url: asset.url,
    altText: asset.altText,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    size: asset.size,
    safetyStatus: asset.safetyStatus,
    createdAt: asset.createdAt,
  };
}

function validateUploadSource(input: z.infer<typeof uploadInput>) {
  if (Boolean(input.sourceUrl) === Boolean(input.fileData)) {
    throw new Error("Provide exactly one sourceUrl or fileData");
  }
  if (input.fileData && !input.mimeType) {
    throw new Error("mimeType is required for fileData");
  }
}

export function registerMediaTools(server: McpServer, context: SlnMcpContext) {
  server.registerTool(
    "media_list",
    {
      title: "List media assets",
      description: "Search media metadata by type, category, safety status and storage provider.",
      inputSchema: {
        type: z.enum(["image", "audio", "video"]).optional(),
        category: z.enum(mediaCategories).optional(),
        safetyStatus: z.enum(["pending", "approved", "rejected"]).optional(),
        storageProvider: z.enum(["local", "s3", "cloudinary"]).optional(),
        search: z.string().trim().optional(),
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().min(8).max(48).default(16),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    (input) =>
      runTool(async () => {
        const result = await listMedia(input);
        return { ...result, items: result.items.map(publicMediaAsset) };
      }),
  );

  server.registerTool(
    "media_upload",
    {
      title: "Upload media asset",
      description:
        "Validate or upload media from an HTTPS URL or encoded file data through the configured SLN storage provider.",
      inputSchema: uploadInput,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    (input) =>
      runTool(async () => {
        validateUploadSource(input);
        const file = input.sourceUrl
          ? await fileFromRemoteUrl(input.sourceUrl, {
              maxBytes: context.config.MCP_MAX_REMOTE_BYTES,
              timeoutMs: context.config.MCP_REMOTE_TIMEOUT_MS,
              fileName: input.fileName,
            })
          : fileFromBase64({
              base64: input.fileData!,
              fileName: input.fileName,
              mimeType: input.mimeType!,
              maxBytes: context.config.MCP_MAX_REMOTE_BYTES,
            });
        if (input.dryRun) {
          const validated = await validateMedia(file);
          return {
            valid: true,
            dryRun: true,
            file: {
              name: file.name,
              detectedMimeType: validated.mimeType,
              mediaType: validated.mediaType,
              extension: validated.extension,
              size: validated.size,
            },
            category: input.category,
            altText: input.altText,
          };
        }
        assertMcpWritable(context);
        return publicMediaAsset(await uploadMedia(file, input.altText, input.category, context.actor.id));
      }),
  );
}
