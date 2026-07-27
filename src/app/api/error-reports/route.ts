import { eq } from "drizzle-orm";
import { getApiSession } from "@/auth/api";
import { db } from "@/db/client";
import { parentProfiles } from "@/db/schema";
import { automaticErrorReportSchema, redactErrorText } from "@/domain/error-reporting";
import { apiJson } from "@/lib/api-response";
import { consumeAutomaticErrorReportRateLimit } from "@/modules/system-feedback/error-reporting-rate-limit";
import { createAutomaticFeedbackFingerprint } from "@/modules/system-feedback/automatic-feedback";
import { createOrAggregateAutomaticFeedback } from "@/modules/system-feedback/system-feedback";

async function readErrorReportingConsent(userId: string) {
  const parent = await db.query.parentProfiles.findFirst({
    columns: { privacySettings: true },
    where: eq(parentProfiles.userId, userId),
  });
  return parent?.privacySettings.errorReporting === true;
}

export async function GET(request: Request) {
  const responseInit = { headers: { "Cache-Control": "private, no-store, max-age=0" } };
  const session = await getApiSession(request);
  if (!session) return apiJson({ enabled: false }, responseInit);
  return apiJson({ enabled: await readErrorReportingConsent(session.user.id) }, responseInit);
}

export async function POST(request: Request) {
  const session = await getApiSession(request);
  if (!session) return apiJson({ message: "Cần đăng nhập" }, { status: 401 });
  if (!(await readErrorReportingConsent(session.user.id))) {
    return apiJson(
      { code: "ERROR_REPORTING_DISABLED", message: "Báo cáo lỗi tự động chưa được bật" },
      { status: 403 },
    );
  }

  const rate = await consumeAutomaticErrorReportRateLimit(session.user.id);
  if (!rate.allowed) {
    return apiJson(
      { code: "ERROR_REPORT_RATE_LIMITED", message: "Đã tạm dừng nhận thêm báo cáo lỗi từ phiên này" },
      { status: 429 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64 * 1024) {
    return apiJson({ message: "Báo cáo lỗi vượt quá giới hạn cho phép" }, { status: 413 });
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > 64 * 1024) {
    return apiJson({ message: "Báo cáo lỗi vượt quá giới hạn cho phép" }, { status: 413 });
  }
  const parsed = automaticErrorReportSchema.safeParse(
    (() => {
      try {
        return JSON.parse(rawBody);
      } catch {
        return null;
      }
    })(),
  );
  if (!parsed.success) {
    return apiJson(
      { message: parsed.error.issues[0]?.message ?? "Báo cáo lỗi chưa hợp lệ" },
      { status: 400 },
    );
  }

  const report = parsed.data;
  const userAgent = redactErrorText(request.headers.get("user-agent") ?? "", 1000) || undefined;
  const release =
    process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? undefined;
  const summary = `[Báo cáo lỗi tự động] ${report.error.name}: ${report.error.message}`.slice(0, 4000);

  try {
    const fingerprint = createAutomaticFeedbackFingerprint(report);
    const result = await createOrAggregateAutomaticFeedback({
      fingerprint,
      userId: session.user.id,
      content: summary,
      pagePath: report.pagePath,
      pageTitle: report.pageTitle || "Báo cáo lỗi tự động",
      context: {
        reportKind: "automatic_error",
        source: report.source,
        error: report.error,
        breadcrumbs: report.breadcrumbs,
        viewportWidth: report.viewportWidth,
        viewportHeight: report.viewportHeight,
        devicePixelRatio: report.devicePixelRatio,
        userAgent,
        release,
      },
    });
    return apiJson(
      {
        id: result.item?.id ?? null,
        accepted: true,
        duplicate: result.duplicate,
        reopened: result.reopened,
        occurrenceCount: result.item?.occurrenceCount ?? 1,
      },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch (error) {
    console.error("[api.automatic_error_report.create_failed]", error);
    return apiJson(
      { code: "AUTOMATIC_ERROR_REPORT_CREATE_FAILED", message: "Chưa thể lưu báo cáo lỗi" },
      { status: 500 },
    );
  }
}
