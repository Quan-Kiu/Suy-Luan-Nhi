import { getApiSession } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { createSystemFeedbackSchema } from "@/domain/system-feedback";
import { getImageUploadPolicies } from "@/modules/media/upload-policy";
import { isMediaUploadError } from "@/modules/media/storage/errors";
import { createSystemFeedback } from "@/modules/system-feedback/system-feedback";
import { getSystemFeedbackRuntimeSettings } from "@/modules/system-feedback/settings";
import { consumeSystemFeedbackRateLimit } from "@/modules/system-feedback/rate-limit";

export async function GET() {
  const [settings, policies] = await Promise.all([
    getSystemFeedbackRuntimeSettings(),
    getImageUploadPolicies(),
  ]);
  return apiJson({ ...settings, policies });
}

export async function POST(request: Request) {
  const session = await getApiSession(request);
  const settings = await getSystemFeedbackRuntimeSettings();
  if (!settings.enabled) {
    return apiJson({ message: "Tính năng góp ý đang tạm tắt" }, { status: 403 });
  }
  const rate = await consumeSystemFeedbackRateLimit(request, session?.user.id);
  if (!rate.allowed) {
    return apiJson(
      { message: `Bạn đã gửi nhiều góp ý liên tiếp. Hãy thử lại sau ${rate.windowMinutes} phút.` },
      { status: 429 },
    );
  }
  const form = await request.formData();
  const parsed = createSystemFeedbackSchema.safeParse({
    content: form.get("content"),
    pagePath: form.get("pagePath"),
    pageTitle: form.get("pageTitle") || undefined,
    viewportWidth: form.get("viewportWidth"),
    viewportHeight: form.get("viewportHeight"),
    devicePixelRatio: form.get("devicePixelRatio"),
    captureMode: form.get("captureMode"),
  });
  if (!parsed.success) {
    return apiJson(
      { message: parsed.error.issues[0]?.message ?? "Nội dung góp ý chưa hợp lệ" },
      { status: 400 },
    );
  }

  const rawImages = form.getAll("images");
  const images = rawImages.filter((value): value is File => value instanceof File && value.size > 0);
  if (images.length !== rawImages.length) {
    return apiJson({ message: "Tệp đính kèm chưa hợp lệ" }, { status: 400 });
  }
  if (images.length > settings.maxAttachments) {
    return apiJson({ message: `Chỉ được đính kèm tối đa ${settings.maxAttachments} ảnh` }, { status: 400 });
  }
  if (images.some((image) => !image.type.startsWith("image/"))) {
    return apiJson({ message: "Phần đính kèm chỉ nhận tệp hình ảnh" }, { status: 400 });
  }

  try {
    const feedback = await createSystemFeedback({
      userId: session?.user.id ?? null,
      content: parsed.data.content,
      pagePath: parsed.data.pagePath,
      pageTitle: parsed.data.pageTitle,
      context: {
        viewportWidth: parsed.data.viewportWidth,
        viewportHeight: parsed.data.viewportHeight,
        devicePixelRatio: parsed.data.devicePixelRatio,
        captureMode: parsed.data.captureMode,
        authenticated: Boolean(session?.user),
      },
      images,
    });
    return apiJson(feedback, { status: 201 });
  } catch (error) {
    if (isMediaUploadError(error)) {
      return apiJson({ code: error.code, message: error.message }, { status: error.status });
    }
    console.error("[api.system_feedback.create_failed]", error);
    return apiJson(
      { code: "SYSTEM_FEEDBACK_CREATE_FAILED", message: "Chưa gửi được góp ý. Hãy thử lại." },
      { status: 500 },
    );
  }
}
