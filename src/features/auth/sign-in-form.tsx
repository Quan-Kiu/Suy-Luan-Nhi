"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { signIn } from "@/auth/client";
import { getAuthenticatedHome } from "@/auth/navigation";
import { CheckboxField, FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { signInSchema } from "@/features/auth/schemas";

export function SignInForm() {
  const content = useContent("auth");
  const router = useRouter();
  const params = useSearchParams();
  const requestedCallback = params.get("callbackUrl");
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
      if (result.error)
        throw new Error(result.error.message ?? contentText(content, "errors.signIn", "Không thể đăng nhập"));
      return result.data;
    },
    onSuccess: (data) => {
      router.push(requestedCallback ?? getAuthenticatedHome(data?.user.role));
      router.refresh();
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <TextField
        type="email"
        autoComplete="email"
        label={contentText(content, "signIn.emailLabel", "Email")}
        placeholder={contentText(content, "signIn.emailPlaceholder", "ba.me@example.com")}
        registration={form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <TextField
        type="password"
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
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
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
  );
}
