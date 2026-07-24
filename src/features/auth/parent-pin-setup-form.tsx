"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { parentApi } from "@/api/parent";
import { FormStatus, HydrationSafeForm, PasswordField, SubmitButton } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { PARENT_PIN_LENGTH, parentPinSetupSchema, type ParentPinSetupInput } from "@/domain/parent-pin";

function keepPinDigits(event: React.ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, PARENT_PIN_LENGTH);
}

export function ParentPinSetupForm({ nextPath }: { nextPath: string }) {
  const content = useContent("auth");
  const [navigating, setNavigating] = useState(false);
  const form = useForm<ParentPinSetupInput>({
    resolver: zodResolver(parentPinSetupSchema),
    defaultValues: { pin: "", confirmPin: "" },
  });
  const mutation = useMutation({
    mutationFn: ({ pin }: ParentPinSetupInput) => parentApi.setupPin({ pin }),
    onSuccess: () => {
      setNavigating(true);
      toast.success(contentText(content, "pinSetup.success", "Mã PIN phụ huynh đã được thiết lập"));
      window.location.replace(nextPath);
    },
  });

  return (
    <HydrationSafeForm
      busy={mutation.isPending || navigating}
      fieldsetClassName="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <div className="rounded-2xl bg-[#edf4df] p-4 text-[#526b43]">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0" size={22} aria-hidden="true" />
          <div>
            <p className="font-black">
              {contentText(content, "pinSetup.whyTitle", "Bảo vệ phần dành cho ba mẹ")}
            </p>
            <p className="type-supporting mt-1">
              {contentText(
                content,
                "pinSetup.whyDescription",
                "Mã PIN giúp bé không vô tình mở tiến độ, cài đặt và dữ liệu gia đình.",
              )}
            </p>
          </div>
        </div>
      </div>
      <PasswordField
        autoComplete="new-password"
        inputMode="numeric"
        maxLength={PARENT_PIN_LENGTH}
        label={contentText(content, "pinSetup.pinLabel", "Tạo mã PIN 6 chữ số")}
        description={contentText(
          content,
          "pinSetup.pinDescription",
          "Tránh dùng 123456, ngày sinh hoặc một chữ số lặp lại.",
        )}
        placeholder={contentText(content, "pinSetup.pinPlaceholder", "Nhập 6 chữ số")}
        registration={form.register("pin", { onChange: keepPinDigits })}
        error={form.formState.errors.pin?.message}
      />
      <PasswordField
        autoComplete="new-password"
        inputMode="numeric"
        maxLength={PARENT_PIN_LENGTH}
        label={contentText(content, "pinSetup.confirmLabel", "Nhập lại mã PIN")}
        placeholder={contentText(content, "pinSetup.confirmPlaceholder", "Nhập lại 6 chữ số")}
        registration={form.register("confirmPin", { onChange: keepPinDigits })}
        error={form.formState.errors.confirmPin?.message}
      />
      <p className="type-caption flex items-start gap-2 rounded-2xl bg-[#fff8e8] p-3 text-[#765c33]">
        <KeyRound className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
        {contentText(
          content,
          "pinSetup.changeHint",
          "Ba mẹ có thể đổi mã PIN sau trong phần Cài đặt gia đình.",
        )}
      </p>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending || navigating}
        pendingLabel={contentText(content, "pinSetup.submitting", "Đang bảo vệ khu vực phụ huynh...")}
      >
        {contentText(content, "pinSetup.submit", "Lưu mã PIN và tiếp tục")}
      </SubmitButton>
    </HydrationSafeForm>
  );
}
