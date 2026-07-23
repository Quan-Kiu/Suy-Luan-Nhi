"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parentApi } from "@/api/parent";
import { FormStatus, PasswordField, SubmitButton } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { parentPinUnlockSchema, PARENT_PIN_MAX_LEGACY_LENGTH } from "@/domain/parent-pin";
import { usePendingRouter } from "@/hooks/use-pending-router";

const schema = z.object({ pin: parentPinUnlockSchema });
type FormValues = z.infer<typeof schema>;

export function ParentGateForm() {
  const content = useContent("parent");
  const navigation = usePendingRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { pin: "" },
  });
  const mutation = useMutation({
    mutationFn: parentApi.unlock,
    onSuccess: () => navigation.refresh(),
  });

  return (
    <Card className="mx-auto mt-7 max-w-md p-5">
      <div className="flex items-center gap-3">
        <LockKeyhole className="text-[#6b8d4a]" aria-hidden="true" />
        <div>
          <p className="font-black">
            {contentText(content, "gate.confirmTitle", "Ba/mẹ nhập mã PIN để tiếp tục")}
          </p>
          <p className="type-supporting mt-1 text-[#786348]">
            {contentText(
              content,
              "gate.pinHelp",
              "Mã PIN bảo vệ tiến độ, cài đặt và dữ liệu gia đình khỏi thao tác nhầm.",
            )}
          </p>
        </div>
      </div>
      <form
        className="mt-5 space-y-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <PasswordField
          autoComplete="current-password"
          inputMode="numeric"
          maxLength={PARENT_PIN_MAX_LEGACY_LENGTH}
          label={contentText(content, "gate.pinPrompt", "Mã PIN phụ huynh")}
          placeholder={contentText(content, "gate.pinPlaceholder", "Nhập mã PIN")}
          registration={form.register("pin", {
            onChange: (event) => {
              event.target.value = event.target.value
                .replace(/\D/g, "")
                .slice(0, PARENT_PIN_MAX_LEGACY_LENGTH);
            },
          })}
          error={form.formState.errors.pin?.message}
          className="type-child-section-title min-h-14 text-center tracking-[0.3em]"
        />
        <div className="flex justify-end">
          <Link href="/auth/forgot-pin" className="font-bold text-[#c55312] underline underline-offset-4">
            {contentText(content, "gate.forgotPin", "Quên mã PIN?")}
          </Link>
        </div>
        <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
        <SubmitButton
          pending={mutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "gate.submitting", "Đang kiểm tra...")}
        >
          {contentText(content, "gate.submit", "Mở khu vực phụ huynh")}
        </SubmitButton>
      </form>
    </Card>
  );
}
