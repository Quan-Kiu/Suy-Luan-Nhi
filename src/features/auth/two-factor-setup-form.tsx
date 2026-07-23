"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Download, KeyRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/auth/client";
import { FormStatus, PasswordField, SubmitButton, TextField } from "@/components/form";
import { usePendingRouter } from "@/hooks/use-pending-router";

const passwordSchema = z.object({ password: z.string().min(1, "Hãy nhập mật khẩu hiện tại") });
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, "Mã xác thực gồm 6 chữ số") });

type SetupData = { totpURI: string; backupCodes: string[] };
type SetupStartInput = { password?: string };

function authErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
export function TwoFactorSetupForm({ requiresPassword }: { requiresPassword: boolean }) {
  const navigation = usePendingRouter();
  const [setup, setSetup] = useState<SetupData | null>(null);
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const enableMutation = useMutation({
    mutationFn: async ({ password }: SetupStartInput) => {
      const result = await authClient.twoFactor.enable({
        ...(password ? { password } : {}),
        issuer: "Suy Luận Nhí",
      });
      if (result.error) throw new Error(result.error.message);
      if (!result.data?.totpURI || !result.data.backupCodes) {
        throw new Error("Không thể tạo thông tin xác thực hai lớp");
      }
      return result.data as SetupData;
    },
    onSuccess: (data) => setSetup(data),
  });
  const verifyMutation = useMutation({
    mutationFn: async ({ code }: z.infer<typeof codeSchema>) => {
      const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: true });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      toast.success("Đã bật xác thực hai lớp");
      navigation.replace("/admin");
      navigation.refresh();
    },
  });

  const secret = useMemo(() => {
    if (!setup?.totpURI) return "";
    try {
      return new URL(setup.totpURI).searchParams.get("secret") ?? "";
    } catch {
      return "";
    }
  }, [setup]);

  if (!setup) {
    const message = enableMutation.isError
      ? authErrorMessage(enableMutation.error, "Không thể bắt đầu thiết lập xác thực hai lớp")
      : undefined;
    return (
      <form
        className="space-y-4"
        onSubmit={
          requiresPassword
            ? passwordForm.handleSubmit((values) => enableMutation.mutate(values))
            : (event) => {
                event.preventDefault();
                enableMutation.mutate({});
              }
        }
        noValidate
      >
        <div className="rounded-2xl bg-amber-50 p-4 text-amber-950">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 shrink-0" size={20} />
            <p className="type-supporting">
              {requiresPassword
                ? "Tài khoản nhân sự phải dùng ứng dụng Authenticator. Mật khẩu được yêu cầu lại để bảo vệ thao tác này."
                : "Tài khoản này đăng nhập bằng Google và không có mật khẩu riêng tại Suy Luận Nhí. Phiên đăng nhập hiện tại sẽ được dùng để bắt đầu thiết lập Authenticator."}
            </p>
          </div>
        </div>
        {requiresPassword ? (
          <PasswordField
            autoComplete="current-password"
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu của bạn"
            registration={passwordForm.register("password")}
            error={passwordForm.formState.errors.password?.message}
          />
        ) : null}
        <FormStatus status={message ? "error" : "idle"} message={message} />
        <SubmitButton pending={enableMutation.isPending} pendingLabel="Đang tạo mã bảo mật...">
          Bắt đầu thiết lập
        </SubmitButton>
      </form>
    );
  }
  const copySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    toast.success("Đã sao chép khóa thiết lập");
  };
  const downloadBackupCodes = () => {
    const blob = new Blob(["Mã dự phòng Suy Luận Nhí\n\n", ...setup.backupCodes.map((code) => `${code}\n`)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "suy-luan-nhi-backup-codes.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const verifyMessage = verifyMutation.isError
    ? authErrorMessage(verifyMutation.error, "Mã xác thực không hợp lệ")
    : undefined;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-2xl border bg-[#faf8f3] p-4 sm:grid-cols-[180px_1fr]">
        <div className="grid place-items-center rounded-2xl bg-white p-3">
          <QRCodeSVG value={setup.totpURI} size={156} level="M" aria-label="Mã QR xác thực hai lớp" />
        </div>
        <div className="min-w-0">
          <h2 className="type-card-title">Quét mã bằng Authenticator</h2>
          <p className="type-supporting mt-2 text-[#6f6558]">
            Dùng Google Authenticator, Microsoft Authenticator, 1Password hoặc ứng dụng TOTP tương thích.
          </p>
          {secret ? (
            <div className="mt-3 rounded-xl bg-white p-3">
              <p className="type-caption font-black text-[#6f6558]">Không quét được mã?</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 text-xs font-bold break-all">{secret}</code>
                <button
                  type="button"
                  aria-label="Sao chép khóa thiết lập"
                  onClick={copySecret}
                  className="rounded-lg border p-2"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="type-card-title text-amber-950">Lưu mã dự phòng ở nơi an toàn</h2>
          <button
            type="button"
            onClick={downloadBackupCodes}
            className="type-action inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-3 py-2"
          >
            <Download size={16} />
            Tải xuống
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm sm:grid-cols-3">
          {setup.backupCodes.map((code) => (
            <code key={code} className="rounded-lg bg-white px-2 py-1.5 text-center">
              {code}
            </code>
          ))}
        </div>
        <p className="type-caption mt-3 text-amber-900">
          Mỗi mã chỉ dùng được một lần. Không lưu chung với mật khẩu hoặc trong ảnh chụp màn hình công khai.
        </p>
      </section>

      <form
        className="space-y-4"
        onSubmit={codeForm.handleSubmit((values) => verifyMutation.mutate(values))}
        noValidate
      >
        <TextField
          inputMode="numeric"
          autoComplete="one-time-code"
          label="Nhập mã 6 chữ số để hoàn tất"
          placeholder="000000"
          registration={codeForm.register("code")}
          error={codeForm.formState.errors.code?.message}
        />
        <FormStatus status={verifyMessage ? "error" : "idle"} message={verifyMessage} />
        <SubmitButton
          className="whitespace-nowrap"
          pending={verifyMutation.isPending || navigation.isPending}
          pendingLabel="Đang xác minh..."
        >
          <Check size={18} />
          Xác minh và tiếp tục
        </SubmitButton>
      </form>
    </div>
  );
}
