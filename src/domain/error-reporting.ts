import { z } from "zod";

export const automaticErrorReportSources = [
  "window_error",
  "unhandled_rejection",
  "error_boundary",
  "api_failure",
] as const;

export type AutomaticErrorReportSource = (typeof automaticErrorReportSources)[number];

export const automaticErrorReportSourceLabels: Record<AutomaticErrorReportSource, string> = {
  window_error: "Lỗi trình duyệt",
  unhandled_rejection: "Lỗi bất đồng bộ chưa được xử lý",
  error_boundary: "Lỗi giao diện React",
  api_failure: "Yêu cầu API thất bại",
};

export const errorBreadcrumbCategories = ["navigation", "interaction", "request", "lifecycle"] as const;
export type ErrorBreadcrumbCategory = (typeof errorBreadcrumbCategories)[number];

const primitiveContextValueSchema = z.union([z.string().max(500), z.number(), z.boolean(), z.null()]);

export const errorBreadcrumbSchema = z.object({
  timestamp: z.string().datetime(),
  category: z.enum(errorBreadcrumbCategories),
  action: z.string().trim().min(1).max(100),
  data: z.record(z.string(), primitiveContextValueSchema).default({}),
});

export type ErrorBreadcrumb = z.infer<typeof errorBreadcrumbSchema>;

export const automaticErrorReportSchema = z.object({
  source: z.enum(automaticErrorReportSources),
  pagePath: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^\/(?!\/)/, "Đường dẫn trang chưa hợp lệ"),
  pageTitle: z.string().trim().max(300).optional(),
  error: z.object({
    name: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(1500),
    stack: z.string().trim().max(12000).optional(),
    digest: z.string().trim().max(300).optional(),
    details: z.record(z.string(), primitiveContextValueSchema).default({}),
  }),
  breadcrumbs: z.array(errorBreadcrumbSchema).max(20).default([]),
  viewportWidth: z.number().int().min(1).max(10000).optional(),
  viewportHeight: z.number().int().min(1).max(10000).optional(),
  devicePixelRatio: z.number().min(0.5).max(10).optional(),
});

export type AutomaticErrorReportInput = z.infer<typeof automaticErrorReportSchema>;

export const storedAutomaticErrorReportContextSchema = automaticErrorReportSchema
  .omit({ pagePath: true, pageTitle: true })
  .extend({
    reportKind: z.literal("automatic_error"),
    userAgent: z.string().max(1000).optional(),
    release: z.string().max(200).optional(),
  });

export type StoredAutomaticErrorReportContext = z.infer<typeof storedAutomaticErrorReportContextSchema>;

const emailPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const jwtPattern = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const uuidPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const longTokenPattern = /\b[A-Za-z0-9_-]{32,}\b/g;
const longNumberPattern = /\b\d{7,}\b/g;
const urlWithQueryPattern = /https?:\/\/[^\s)\]}>]+/g;

function stripUrlDetails(value: string) {
  return value.replace(urlWithQueryPattern, (raw) => {
    try {
      const url = new URL(raw);
      return `${url.origin}${url.pathname}`;
    } catch {
      return raw.split(/[?#]/, 1)[0] ?? raw;
    }
  });
}

export function redactErrorText(value: string, maxLength = 1500) {
  return stripUrlDetails(value)
    .replace(bearerPattern, "Bearer [redacted]")
    .replace(jwtPattern, "[redacted-token]")
    .replace(emailPattern, "[redacted-email]")
    .replace(uuidPattern, "[redacted-id]")
    .replace(longTokenPattern, "[redacted-token]")
    .replace(longNumberPattern, "[redacted-number]")
    .slice(0, maxLength);
}

export function sanitizeRoutePath(rawValue: string) {
  try {
    const url = new URL(rawValue, "https://local.invalid");
    const path = url.pathname || "/";
    return redactErrorText(path, 500)
      .replaceAll("[redacted-id]", ":id")
      .replaceAll("[redacted-token]", ":token")
      .replaceAll("[redacted-number]", ":number");
  } catch {
    const path = rawValue.split(/[?#]/, 1)[0] || "/";
    return redactErrorText(path, 500);
  }
}

export function normalizeUnknownError(value: unknown) {
  if (value instanceof Error) {
    return {
      name: redactErrorText(value.name || "Error", 120) || "Error",
      message: redactErrorText(value.message || "Đã xảy ra lỗi không xác định", 1500),
      stack: value.stack ? redactErrorText(value.stack, 12000) : undefined,
    };
  }

  if (typeof value === "string") {
    return {
      name: "Error",
      message: redactErrorText(value, 1500) || "Đã xảy ra lỗi không xác định",
    };
  }

  return {
    name: "Error",
    message: "Đã xảy ra lỗi không xác định",
  };
}
