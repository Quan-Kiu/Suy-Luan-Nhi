"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { accountApi } from "@/api/account";
import { FormStatus, HydrationSafeForm, PasswordField, SubmitButton } from "@/components/form";
import { forcedPasswordChangeSchema, type ForcedPasswordChangeInput } from "@/domain/admin-account-reset";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function ChangeTemporaryPasswordForm({ destination }: { destination: string }) {
  const navigation = usePendingRouter();
  const form = useForm<ForcedPasswordChangeInput>({
    resolver: zodResolver(forcedPasswordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const mutation = useMutation({
    mutationFn: accountApi.completeTemporaryPassword,
    onSuccess: () => {
      toast.success("Đã đổi mật khẩu. Bạn có thể tiếp tục sử dụng tài khoản.");
      navigation.push(destination);
    },
  });
  const pending = mutation.isPending || navigation.isPending;

  return (
    <HydrationSafeForm
      busy={pending}
      fieldsetClassName="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <PasswordField
        autoComplete="current-password"
        label="Mật khẩu tạm thời"
        placeholder="Nhập mật khẩu quản trị viên đã cung cấp"
        registration={form.register("currentPassword")}
        error={form.formState.errors.currentPassword?.message}
      />
      <PasswordField
        autoComplete="new-password"
        label="Mật khẩu mới"
        placeholder="Ít nhất 10 ký tự"
        registration={form.register("newPassword")}
        error={form.formState.errors.newPassword?.message}
      />
      <PasswordField
        autoComplete="new-password"
        label="Nhập lại mật khẩu mới"
        placeholder="Nhập lại mật khẩu mới"
        registration={form.register("confirmPassword")}
        error={form.formState.errors.confirmPassword?.message}
      />
      <FormStatus
        status={mutation.isError ? "error" : "idle"}
        message={mutation.isError ? mutation.error.message : undefined}
      />
      <SubmitButton pending={pending} pendingLabel="Đang đổi mật khẩu...">
        Đổi mật khẩu và tiếp tục
      </SubmitButton>
    </HydrationSafeForm>
  );
}
