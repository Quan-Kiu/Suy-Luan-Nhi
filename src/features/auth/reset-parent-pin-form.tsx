"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { parentApi } from "@/api/parent";
import { FormStatus, HydrationSafeForm, PasswordField, SubmitButton } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { PARENT_PIN_LENGTH, parentPinSetupSchema, type ParentPinSetupInput } from "@/domain/parent-pin";
import { usePendingRouter } from "@/hooks/use-pending-router";

function keepDigits(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, PARENT_PIN_LENGTH);
}

export function ResetParentPinForm() {
  const content = useContent("auth");
  const navigation = usePendingRouter();
  const token = useSearchParams().get("token");
  const form = useForm<ParentPinSetupInput>({
    resolver: zodResolver(parentPinSetupSchema),
    defaultValues: { pin: "", confirmPin: "" },
  });
  const mutation = useMutation({
    mutationFn: (values: ParentPinSetupInput) => {
      if (!token)
        throw new Error(
          contentText(content, "pinReset.invalidLink", "Liên kết không hợp lệ hoặc đã hết hạn."),
        );
      return parentApi.resetPin({ token, ...values });
    },
    onSuccess: () => {
      toast.success(contentText(content, "pinReset.success", "Mã PIN phụ huynh đã được cập nhật"));
      navigation.push("/parent");
    },
  });

  if (!token) {
    return (
      <FormStatus
        status="error"
        message={contentText(content, "pinReset.invalidLink", "Liên kết không hợp lệ hoặc đã hết hạn.")}
      />
    );
  }

  return (
    <HydrationSafeForm
      busy={mutation.isPending || navigation.isPending}
      fieldsetClassName="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <PasswordField
        autoComplete="new-password"
        inputMode="numeric"
        maxLength={PARENT_PIN_LENGTH}
        label={contentText(content, "pinReset.pinLabel", "Tạo mã PIN mới gồm 6 chữ số")}
        description={contentText(
          content,
          "pinSetup.pinDescription",
          "Tránh dùng 123456, ngày sinh hoặc một chữ số lặp lại.",
        )}
        placeholder={contentText(content, "pinSetup.pinPlaceholder", "Nhập 6 chữ số")}
        registration={form.register("pin", { onChange: keepDigits })}
        error={form.formState.errors.pin?.message}
      />
      <PasswordField
        autoComplete="new-password"
        inputMode="numeric"
        maxLength={PARENT_PIN_LENGTH}
        label={contentText(content, "pinReset.confirmLabel", "Nhập lại mã PIN mới")}
        placeholder={contentText(content, "pinSetup.confirmPlaceholder", "Nhập lại 6 chữ số")}
        registration={form.register("confirmPin", { onChange: keepDigits })}
        error={form.formState.errors.confirmPin?.message}
      />
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel={contentText(content, "pinReset.resetting", "Đang cập nhật...")}
      >
        {contentText(content, "pinReset.resetSubmit", "Lưu mã PIN mới")}
      </SubmitButton>
    </HydrationSafeForm>
  );
}
