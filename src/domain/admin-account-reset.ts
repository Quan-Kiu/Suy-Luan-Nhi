import { z } from "zod";
import { parentPinValueSchema } from "@/domain/parent-pin";

export const adminPasswordResetSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("email_link") }),
  z.object({
    mode: z.literal("temporary_password"),
    temporaryPassword: z.string().min(10, "Mật khẩu tạm thời cần ít nhất 10 ký tự").max(128),
  }),
]);

export const adminParentPinResetSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("clear") }),
  z.object({ mode: z.literal("temporary_pin"), temporaryPin: parentPinValueSchema }),
]);

export const forcedPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu tạm thời"),
    newPassword: z.string().min(10, "Mật khẩu mới cần ít nhất 10 ký tự").max(128),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu mới"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại chưa khớp",
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới cần khác mật khẩu tạm thời",
  });

export type AdminPasswordResetInput = z.infer<typeof adminPasswordResetSchema>;
export type AdminParentPinResetInput = z.infer<typeof adminParentPinResetSchema>;
export type ForcedPasswordChangeInput = z.infer<typeof forcedPasswordChangeSchema>;
