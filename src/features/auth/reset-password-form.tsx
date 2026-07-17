"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { authClient } from "@/auth/client";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { resetPasswordSchema } from "@/features/auth/schemas";

export function ResetPasswordForm() {
  const content = useContent("auth");
  const router = useRouter();
  const token = useSearchParams().get("token");
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ password }: z.infer<typeof resetPasswordSchema>) => {
      if (!token) throw new Error(contentText(content, "reset.invalidLink", "Liên kết không hợp lệ."));
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error)
        throw new Error(
          result.error.message ?? contentText(content, "errors.reset", "Không thể đổi mật khẩu"),
        );
      return result.data;
    },
    onSuccess: () => {
      toast.success(contentText(content, "reset.success", "Mật khẩu đã được cập nhật"));
      router.push("/auth/sign-in");
    },
  });

  if (!token) {
    return (
      <FormStatus
        status="error"
        message={contentText(
          content,
          "reset.invalidLink",
          "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
        )}
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <TextField
        type="password"
        autoComplete="new-password"
        label={contentText(content, "reset.passwordLabel", "Mật khẩu mới")}
        placeholder={contentText(content, "reset.passwordPlaceholder", "Mật khẩu mới ít nhất 10 ký tự")}
        registration={form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <TextField
        type="password"
        autoComplete="new-password"
        label={contentText(content, "signUp.confirmPasswordLabel", "Nhập lại mật khẩu")}
        placeholder={contentText(content, "reset.confirmPlaceholder", "Nhập lại mật khẩu mới")}
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "reset.submitting", "Đang cập nhật...")}
      >
        {contentText(content, "reset.submit", "Cập nhật mật khẩu")}
      </SubmitButton>
    </form>
  );
}
