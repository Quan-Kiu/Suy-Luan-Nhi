import { readLocalMedia } from "@/modules/media/storage";

export const runtime = "nodejs";

type UploadRouteContext = { params: Promise<{ segments: string[] }> };

async function mediaResponse(context: UploadRouteContext, includeBody: boolean) {
  const { segments } = await context.params;
  const media = await readLocalMedia(segments);
  if (!media) return new Response(null, { status: 404 });

  return new Response(includeBody ? new Uint8Array(media.buffer) : null, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(media.buffer.byteLength),
      "Content-Type": media.mimeType,
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}

export async function GET(_request: Request, context: UploadRouteContext) {
  return mediaResponse(context, true);
}

export async function HEAD(_request: Request, context: UploadRouteContext) {
  return mediaResponse(context, false);
}
