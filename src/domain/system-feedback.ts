import { z } from "zod";

export const systemFeedbackStatuses = ["new", "in_progress", "resolved", "dismissed"] as const;
export type SystemFeedbackStatus = (typeof systemFeedbackStatuses)[number];

export const systemFeedbackStatusLabels: Record<SystemFeedbackStatus, string> = {
  new: "Mới nhận",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  dismissed: "Đã đóng",
};

export const systemFeedbackColumnPageSize = 10;
export const systemFeedbackMaxAttachments = 10;

export const systemFeedbackContentSchema = z
  .string()
  .trim()
  .min(10, "Nội dung góp ý cần ít nhất 10 ký tự")
  .max(4000, "Nội dung góp ý không được vượt quá 4.000 ký tự");

export const createSystemFeedbackSchema = z.object({
  content: systemFeedbackContentSchema,
  pagePath: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^\/(?!\/)/, "Đường dẫn trang chưa hợp lệ"),
  pageTitle: z.string().trim().max(300).optional(),
  viewportWidth: z.coerce.number().int().min(1).max(10000),
  viewportHeight: z.coerce.number().int().min(1).max(10000),
  devicePixelRatio: z.coerce.number().min(0.5).max(10),
  captureMode: z.enum(["auto", "upload", "mixed", "none"]),
});

export const updateSystemFeedbackSchema = z.object({
  status: z.enum(systemFeedbackStatuses),
  adminNote: z.string().trim().max(2000, "Ghi chú không được vượt quá 2.000 ký tự").optional(),
});
