"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient, signIn, signUp } from "@/auth/client";
import { Button } from "@/components/ui";
import { contentText, useContent } from "@/content/client";

const emailSchema = z.string().trim().email("Email chưa đúng định dạng");
const passwordSchema = z.string().min(10, "Mật khẩu cần ít nhất 10 ký tự");
const signInSchema = z.object({ email: emailSchema, password: passwordSchema, rememberMe: z.boolean() });
const signUpSchema = z
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
const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại chưa khớp",
  });

const inputClass =
  "min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] px-4 outline-none focus:border-[#e9641a]";

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm font-bold text-red-700">{message}</p> : null;
}

export function SignInForm() {
  const content = useContent("auth");
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = params.get("callbackUrl") || "/profiles";
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setPending(true);
        const result = await signIn.email({ ...values, callbackURL });
        setPending(false);
        if (result.error) {
          toast.error(result.error.message ?? "Không thể đăng nhập");
          return;
        }
        router.push(callbackURL);
        router.refresh();
      })}
    >
      <label className="block font-bold">
        Email
        <input
          type="email"
          autoComplete="email"
          placeholder={contentText(content, "signIn.emailPlaceholder", "ba.me@example.com")}
          className={inputClass}
          {...form.register("email")}
        />
        <ErrorText message={form.formState.errors.email?.message} />
      </label>
      <label className="block font-bold">
        Mật khẩu
        <input
          type="password"
          autoComplete="current-password"
          placeholder={contentText(content, "signIn.passwordPlaceholder", "Nhập mật khẩu")}
          className={inputClass}
          {...form.register("password")}
        />
        <ErrorText message={form.formState.errors.password?.message} />
      </label>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" className="size-5 accent-[#e9641a]" {...form.register("rememberMe")} />
        Ghi nhớ đăng nhập trên thiết bị này
      </label>
      <Button className="w-full" disabled={pending}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/auth/forgot-password" className="font-bold text-[#c55312] underline">
          Quên mật khẩu?
        </Link>
        <Link href="/auth/sign-up" className="font-bold text-[#50723e] underline">
          Tạo tài khoản
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const content = useContent("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async ({ confirmPassword, ...values }) => {
        void confirmPassword;
        setPending(true);
        const result = await signUp.email({ ...values, callbackURL: "/profiles" });
        setPending(false);
        if (result.error) {
          toast.error(result.error.message ?? "Không thể tạo tài khoản");
          return;
        }
        toast.success("Tài khoản đã được tạo");
        router.push("/profiles");
        router.refresh();
      })}
    >
      <label className="block font-bold">
        Tên ba/mẹ
        <input
          autoComplete="name"
          placeholder={contentText(content, "signUp.parentNamePlaceholder", "Ví dụ: Nguyễn Minh Anh")}
          className={inputClass}
          {...form.register("name")}
        />
        <ErrorText message={form.formState.errors.name?.message} />
      </label>
      <label className="block font-bold">
        Email
        <input
          type="email"
          autoComplete="email"
          placeholder="ba.me@example.com"
          className={inputClass}
          {...form.register("email")}
        />
        <ErrorText message={form.formState.errors.email?.message} />
      </label>
      <label className="block font-bold">
        Mật khẩu
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Tạo mật khẩu ít nhất 10 ký tự"
          className={inputClass}
          {...form.register("password")}
        />
        <ErrorText message={form.formState.errors.password?.message} />
      </label>
      <label className="block font-bold">
        Nhập lại mật khẩu
        <input
          type="password"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          className={inputClass}
          {...form.register("confirmPassword")}
        />
        <ErrorText message={form.formState.errors.confirmPassword?.message} />
      </label>
      <p className="rounded-2xl bg-[#edf4df] p-3 text-xs leading-5 text-[#567044]">
        Tài khoản này thuộc phụ huynh. Bé không cần email, ngày sinh đầy đủ hoặc thông tin định danh.
      </p>
      <Button className="w-full" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo tài khoản phụ huynh"}
      </Button>
      <p className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/auth/sign-in" className="font-bold text-[#c55312] underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });
  if (sent)
    return (
      <div className="rounded-2xl bg-[#edf4df] p-5 text-center">
        <p className="font-black text-[#527040]">Hãy kiểm tra hộp thư</p>
        <p className="mt-2 text-sm">Nếu email tồn tại, ba/mẹ sẽ nhận được liên kết đặt lại mật khẩu.</p>
      </div>
    );
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async ({ email }) => {
        setPending(true);
        await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        setPending(false);
        setSent(true);
      })}
    >
      <label className="block font-bold">
        Email tài khoản
        <input
          type="email"
          placeholder="ba.me@example.com"
          className={inputClass}
          {...form.register("email")}
        />
        <ErrorText message={form.formState.errors.email?.message} />
      </label>
      <Button className="w-full" disabled={pending}>
        {pending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  if (!token)
    return (
      <p className="rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">
        Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
      </p>
    );
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async ({ password }) => {
        setPending(true);
        const result = await authClient.resetPassword({ newPassword: password, token });
        setPending(false);
        if (result.error) {
          toast.error(result.error.message ?? "Không thể đổi mật khẩu");
          return;
        }
        toast.success("Mật khẩu đã được cập nhật");
        router.push("/auth/sign-in");
      })}
    >
      <label className="block font-bold">
        Mật khẩu mới
        <input
          type="password"
          placeholder="Mật khẩu mới ít nhất 10 ký tự"
          className={inputClass}
          {...form.register("password")}
        />
        <ErrorText message={form.formState.errors.password?.message} />
      </label>
      <label className="block font-bold">
        Nhập lại mật khẩu
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          className={inputClass}
          {...form.register("confirmPassword")}
        />
        <ErrorText message={form.formState.errors.confirmPassword?.message} />
      </label>
      <Button className="w-full" disabled={pending}>
        {pending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </Button>
    </form>
  );
}
