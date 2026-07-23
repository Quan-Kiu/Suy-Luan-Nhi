"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/auth/client";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { usePendingRouter } from "@/hooks/use-pending-router";

const totpSchema = z.object({ code: z.string().regex(/^\d{6}$/, "Mã xác thực gồm 6 chữ số") });
const backupSchema = z.object({ code: z.string().min(6, "Hãy nhập đầy đủ mã dự phòng") });

type Mode = "totp" | "backup";

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Không thể xác minh mã bảo mật";
}

export function TwoFactorChallengeForm() {
  const navigation = usePendingRouter();
  const [mode, setMode] = useState<Mode>("totp");
  const form = useForm<{ code: string }>({
    resolver: zodResolver(mode === "totp" ? totpSchema : backupSchema),
    defaultValues: { code: "" },
  });
  const mutation = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const result =
        mode === "totp"
          ? await authClient.twoFactor.verifyTotp({ code, trustDevice: true })
          : await authClient.twoFactor.verifyBackupCode({ code, trustDevice: true });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      navigation.replace("/admin");
      navigation.refresh();
    },
  });
  const message = mutation.isError ? errorMessage(mutation.error) : undefined;

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    form.reset({ code: "" });
    mutation.reset();
  };

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="rounded-2xl bg-blue-50 p-4 text-blue-950">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0" size={20} />
          <p className="type-supporting">
            {mode === "totp"
              ? "Mở ứng dụng Authenticator và nhập mã đang hiển thị."
              : "Nhập một mã dự phòng chưa từng sử dụng."}
          </p>
        </div>
      </div>
      <TextField
        inputMode={mode === "totp" ? "numeric" : "text"}
        autoComplete="one-time-code"
        label={mode === "totp" ? "Mã xác thực" : "Mã dự phòng"}
        placeholder={mode === "totp" ? "000000" : "Nhập mã dự phòng"}
        registration={form.register("code")}
        error={form.formState.errors.code?.message}
      />
      <FormStatus status={message ? "error" : "idle"} message={message} />
      <SubmitButton pending={mutation.isPending || navigation.isPending} pendingLabel="Đang xác minh...">
        Xác minh
      </SubmitButton>
      <button
        type="button"
        onClick={() => changeMode(mode === "totp" ? "backup" : "totp")}
        className="type-action w-full rounded-xl px-3 py-2 text-[#50723e] underline"
      >
        {mode === "totp" ? "Dùng mã dự phòng" : "Dùng mã từ Authenticator"}
      </button>
    </form>
  );
}
