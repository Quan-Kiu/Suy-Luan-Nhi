"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { authClient } from "@/auth/client";
import { FormStatus, HydrationSafeForm, PasswordField, SubmitButton } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";
import { resetPasswordSchema } from "@/features/auth/schemas";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function ResetPasswordForm() {
  const content = useContent("auth");
  const navigation = usePendingRouter();
  const token = useSearchParams().get("token");
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ password }: z.infer<typeof resetPasswordSchema>) => {
      if (!token) throw toAuthFlowError({ code: "INVALID_TOKEN" }, "PASSWORD_RESET_FAILED");
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) throw toAuthFlowError(result.error, "PASSWORD_RESET_FAILED");
      return result.data;
    },
    onSuccess: () => {
      toast.success(contentText(content, "reset.success", "Mật khẩu đã được cập nhật"));
      navigation.push("/auth/sign-in");
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

  const errorMessage = mutation.isError
    ? getAuthErrorMessage(content, mutation.error, "PASSWORD_RESET_FAILED")
    : undefined;
  return (
    <HydrationSafeForm
      busy={mutation.isPending || navigation.isPending}
      fieldsetClassName="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <PasswordField
        autoComplete="new-password"
        label={contentText(content, "reset.passwordLabel", "Mật khẩu mới")}
        placeholder={contentText(content, "reset.passwordPlaceholder", "Mật khẩu mới ít nhất 10 ký tự")}
        registration={form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <PasswordField
        autoComplete="new-password"
        label={contentText(content, "signUp.confirmPasswordLabel", "Nhập lại mật khẩu")}
        placeholder={contentText(content, "reset.confirmPlaceholder", "Nhập lại mật khẩu mới")}
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel={contentText(content, "reset.submitting", "Đang cập nhật...")}
      >
        {contentText(content, "reset.submit", "Cập nhật mật khẩu")}
      </SubmitButton>
    </HydrationSafeForm>
  );
}
