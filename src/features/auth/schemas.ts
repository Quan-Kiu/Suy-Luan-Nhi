import { z } from "zod";

const emailSchema = z.string().trim().email("Email chưa đúng định dạng");
const passwordSchema = z.string().min(10, "Mật khẩu cần ít nhất 10 ký tự");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Tên ba/mẹ cần ít nhất 2 ký tự"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại chưa khớp",
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại chưa khớp",
  });
