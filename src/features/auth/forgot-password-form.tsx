"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { authClient } from "@/auth/client";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";
import { forgotPasswordSchema } from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const content = useContent("auth");
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ email }: z.infer<typeof forgotPasswordSchema>) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (result.error) throw toAuthFlowError(result.error, "PASSWORD_RESET_REQUEST_FAILED");
      return result.data;
    },
  });

  if (mutation.isSuccess) {
    return (
      <FormStatus
        status="success"
        title={contentText(content, "forgot.sentTitle", "Hãy kiểm tra hộp thư")}
        message={contentText(
          content,
          "forgot.sentDescription",
          "Nếu email tồn tại, ba/mẹ sẽ nhận được liên kết đặt lại mật khẩu.",
        )}
      />
    );
  }

  const errorMessage = mutation.isError
    ? getAuthErrorMessage(content, mutation.error, "PASSWORD_RESET_REQUEST_FAILED")
    : undefined;
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <TextField
        type="email"
        autoComplete="email"
        label={contentText(content, "forgot.emailLabel", "Email tài khoản")}
        placeholder={contentText(content, "signIn.emailPlaceholder", "ba.me@example.com")}
        registration={form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "forgot.submitting", "Đang gửi...")}
      >
        {contentText(content, "forgot.submit", "Gửi liên kết đặt lại")}
      </SubmitButton>
    </form>
  );
}
