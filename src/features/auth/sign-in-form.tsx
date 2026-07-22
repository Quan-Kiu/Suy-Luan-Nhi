"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { signIn } from "@/auth/client";
import { getAuthenticatedHome } from "@/auth/navigation";
import { CheckboxField, FormStatus, PasswordField, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { EmailVerificationDialog } from "@/features/auth/email-verification-dialog";
import { getAuthErrorMessage, isAuthError, toAuthFlowError } from "@/features/auth/auth-errors";
import { signInSchema } from "@/features/auth/schemas";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function SignInForm() {
  const content = useContent("auth");
  const navigation = usePendingRouter();
  const params = useSearchParams();
  const requestedCallback = params.get("callbackUrl");
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof signInSchema>) => {
      const result = await signIn.email({
        ...values,
        ...(requestedCallback ? { callbackURL: requestedCallback } : {}),
      });
      if (result.error) throw toAuthFlowError(result.error, "SIGN_IN_FAILED");
      return result.data;
    },
    onSuccess: (data) => {
      navigation.push(requestedCallback ?? getAuthenticatedHome(data?.user.role));
    },
    onError: (error, values) => {
      if (isAuthError(error, "EMAIL_NOT_VERIFIED")) setVerificationEmail(values.email);
    },
  });
  const verificationRequired = mutation.isError && isAuthError(mutation.error, "EMAIL_NOT_VERIFIED");
  const errorMessage =
    mutation.isError && !verificationRequired
      ? getAuthErrorMessage(content, mutation.error, "SIGN_IN_FAILED")
      : undefined;

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <TextField
          type="email"
          autoComplete="email"
          label={contentText(content, "signIn.emailLabel", "Email")}
          placeholder={contentText(content, "signIn.emailPlaceholder", "ba.me@example.com")}
          registration={form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          autoComplete="current-password"
          label={contentText(content, "signIn.passwordLabel", "Mật khẩu")}
          placeholder={contentText(content, "signIn.passwordPlaceholder", "Nhập mật khẩu")}
          registration={form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <CheckboxField
          label={contentText(content, "signIn.rememberMe", "Ghi nhớ đăng nhập trên thiết bị này")}
          registration={form.register("rememberMe")}
        />
        <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
        <SubmitButton
          pending={mutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "signIn.submitting", "Đang đăng nhập...")}
        >
          {contentText(content, "signIn.submit", "Đăng nhập")}
        </SubmitButton>
        <div className="flex justify-between text-sm">
          <Link href="/auth/forgot-password" className="font-bold text-[#c55312] underline">
            {contentText(content, "signIn.forgot", "Quên mật khẩu?")}
          </Link>
          <Link href="/auth/sign-up" className="font-bold text-[#50723e] underline">
            {contentText(content, "signIn.createAccount", "Tạo tài khoản")}
          </Link>
        </div>
      </form>
      <EmailVerificationDialog
        open={Boolean(verificationEmail)}
        email={verificationEmail ?? ""}
        callbackURL={requestedCallback ?? "/profiles"}
        retryPending={mutation.isPending || navigation.isPending}
        onClose={() => {
          setVerificationEmail(null);
          mutation.reset();
        }}
        onRetry={() => {
          setVerificationEmail(null);
          mutation.reset();
          mutation.mutate(form.getValues());
        }}
      />
    </>
  );
}
