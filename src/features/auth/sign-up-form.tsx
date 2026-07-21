"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { signUp } from "@/auth/client";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";
import { EmailVerificationStep } from "@/features/auth/email-verification-step";
import { signUpSchema } from "@/features/auth/schemas";

export function SignUpForm() {
  const content = useContent("auth");
  const router = useRouter();
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ confirmPassword: _, ...values }: z.infer<typeof signUpSchema>) => {
      void _;
      const result = await signUp.email({ ...values, callbackURL: "/profiles" });
      if (result.error) throw toAuthFlowError(result.error, "SIGN_UP_FAILED");
      return result.data;
    },
    onSuccess: (data, values) => {
      if (!data?.token) {
        setVerificationEmail(values.email);
        return;
      }
      toast.success(contentText(content, "signUp.success", "Tài khoản đã được tạo"));
      router.push("/profiles");
      router.refresh();
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
      <TextField
        type="password"
        autoComplete="new-password"
        label={contentText(content, "signIn.passwordLabel", "Mật khẩu")}
        placeholder={contentText(content, "signUp.passwordPlaceholder", "Tạo mật khẩu ít nhất 10 ký tự")}
        registration={form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <TextField
        type="password"
        autoComplete="new-password"
        label={contentText(content, "signUp.confirmPasswordLabel", "Nhập lại mật khẩu")}
        placeholder={contentText(content, "signUp.confirmPasswordPlaceholder", "Nhập lại mật khẩu")}
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <p className="rounded-2xl bg-[#edf4df] p-3 text-xs leading-5 text-[#567044]">
        {contentText(
          content,
          "signUp.privacyNote",
          "Tài khoản này thuộc phụ huynh. Bé không cần email hoặc thông tin định danh.",
        )}
      </p>
      <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "signUp.submitting", "Đang tạo...")}
      >
        {contentText(content, "signUp.submit", "Tạo tài khoản phụ huynh")}
      </SubmitButton>
      <p className="text-center text-sm">
        {contentText(content, "signUp.hasAccount", "Đã có tài khoản?")}{" "}
        <Link href="/auth/sign-in" className="font-bold text-[#c55312] underline">
          {contentText(content, "signIn.submit", "Đăng nhập")}
        </Link>
      </p>
    </form>
  );
}
