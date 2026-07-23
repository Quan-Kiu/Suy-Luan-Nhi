"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { signUp } from "@/auth/client";
import { buildEmailVerificationCallback } from "@/auth/email-verification";
import { buildAuthCompletePath, buildParentPinSetupPath } from "@/auth/navigation";
import { FormStatus, PasswordField, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";
import { EmailVerificationStep } from "@/features/auth/email-verification-step";
import { GoogleAuthButton } from "@/features/auth/google-auth-button";
import { signUpSchema } from "@/features/auth/schemas";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function SignUpForm({
  googleAuthEnabled = false,
  oauthError,
}: {
  googleAuthEnabled?: boolean;
  oauthError?: string | null;
}) {
  const content = useContent("auth");
  const navigation = usePendingRouter();
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ confirmPassword: _, ...values }: z.infer<typeof signUpSchema>) => {
      void _;
      const result = await signUp.email({
        ...values,
        callbackURL: buildEmailVerificationCallback(buildParentPinSetupPath("/onboarding")),
      });
      if (result.error) throw toAuthFlowError(result.error, "SIGN_UP_FAILED");
      return result.data;
    },
    onSuccess: (data, values) => {
      if (!data?.token) {
        setVerificationEmail(values.email);
        return;
      }
      toast.success(contentText(content, "signUp.success", "Tài khoản đã được tạo"));
      navigation.push(buildParentPinSetupPath("/onboarding"));
    },
  });

  if (verificationEmail) {
    return (
      <EmailVerificationStep
        email={verificationEmail}
        onUseDifferentEmail={() => {
          setVerificationEmail(null);
          mutation.reset();
          form.setValue("email", "");
          form.setValue("password", "");
          form.setValue("confirmPassword", "");
          requestAnimationFrame(() => form.setFocus("email"));
        }}
      />
    );
  }

  const errorMessage = mutation.isError
    ? getAuthErrorMessage(content, mutation.error, "SIGN_UP_FAILED")
    : undefined;
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      {googleAuthEnabled ? (
        <GoogleAuthButton
          mode="sign-up"
          callbackURL={buildAuthCompletePath("/onboarding")}
          errorCallbackURL="/auth/sign-up?oauth=google"
          callbackError={oauthError}
        />
      ) : null}
      <TextField
        autoComplete="name"
        label={contentText(content, "signUp.parentNameLabel", "Tên ba/mẹ")}
        placeholder={contentText(content, "signUp.parentNamePlaceholder", "Ví dụ: Nguyễn Minh Anh")}
        registration={form.register("name")}
        error={form.formState.errors.name?.message}
      />
      <TextField
        type="email"
        autoComplete="email"
        label={contentText(content, "signIn.emailLabel", "Email")}
        placeholder={contentText(content, "signUp.emailPlaceholder", "ba.me@example.com")}
        registration={form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <PasswordField
        autoComplete="new-password"
        label={contentText(content, "signIn.passwordLabel", "Mật khẩu")}
        placeholder={contentText(content, "signUp.passwordPlaceholder", "Tạo mật khẩu ít nhất 10 ký tự")}
        registration={form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <PasswordField
        autoComplete="new-password"
        label={contentText(content, "signUp.confirmPasswordLabel", "Nhập lại mật khẩu")}
        placeholder={contentText(content, "signUp.confirmPasswordPlaceholder", "Nhập lại mật khẩu")}
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <p className="type-caption rounded-2xl bg-[#edf4df] p-3 text-[#567044]">
        {contentText(
          content,
          "signUp.flowPrivacyNote",
          "Chỉ ba mẹ cần tài khoản. Bé không cần email, tên thật hoặc ngày sinh đầy đủ.",
        )}
      </p>
      <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel={contentText(content, "signUp.submitting", "Đang tạo...")}
      >
        {contentText(content, "signUp.flowSubmit", "Tạo tài khoản ba mẹ")}
      </SubmitButton>
      <p className="type-supporting text-center">
        {contentText(content, "signUp.hasAccount", "Đã có tài khoản?")}{" "}
        <Link href="/auth/sign-in" className="font-bold text-[#c55312] underline">
          {contentText(content, "signIn.submit", "Đăng nhập")}
        </Link>
      </p>
    </form>
  );
}
