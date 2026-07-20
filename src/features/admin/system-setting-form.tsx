"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { systemSettingsApi, type SystemSetting } from "@/api/admin/settings";
import {
  ControlledCheckboxField,
  FormStatus,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import {
  describeSetting,
  getSystemSettingKind,
  humanizeSettingKey,
  parseSystemSetting,
  serializeSystemSetting,
  systemSettingKindLabels,
} from "@/domain/system-setting-presentation";

const schema = z.object({
  text: z.string(),
  enabled: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function SystemSettingForm({
  item,
  onSaved,
}: {
  item: SystemSetting;
  onSaved: (item: SystemSetting) => void;
}) {
  const kind = getSystemSettingKind(item.value);
  const fieldId = `setting-${item.key.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: serializeSystemSetting(item.value, kind),
      enabled: kind === "boolean" ? Boolean(item.value) : false,
    },
  });
  const mutation = useMutation({
    mutationFn: ({ text, enabled }: FormValues) =>
      systemSettingsApi.save(item.key, parseSystemSetting(kind, text, enabled)),
    onSuccess: (saved) => {
      form.reset({
        text: serializeSystemSetting(saved.value, kind),
        enabled: kind === "boolean" ? Boolean(saved.value) : false,
      });
      onSaved(saved);
      toast.success("Đã lưu cấu hình hệ thống");
    },
  });
  const status = mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle";
  const statusMessage = mutation.isError
    ? mutation.error.message
    : mutation.isSuccess
      ? "Thay đổi đã được ghi nhận. Hãy kiểm tra màn hình liên quan."
      : undefined;

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
          <Settings2 size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="font-black text-[#342f28]">{humanizeSettingKey(item.key)}</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f6558]">{describeSetting(item.key)}</p>
          <span className="mt-2 inline-flex rounded-full bg-[#f5f2ec] px-3 py-1 text-xs font-black text-[#6f6558]">
            {systemSettingKindLabels[kind]}
          </span>
        </div>
      </div>

      {kind === "boolean" ? (
        <ControlledCheckboxField
          id={`${fieldId}-enabled`}
          control={form.control}
          name="enabled"
          label="Bật thiết lập này"
          description="Bỏ chọn để tắt. Thay đổi chỉ có hiệu lực sau khi nhấn lưu."
        />
      ) : kind === "structured" ? (
        <TextareaField
          id={`${fieldId}-structured`}
          label="Nội dung nâng cao"
          rows={7}
          description="Chỉ chỉnh khi đã hiểu cấu trúc. Giữ đúng dấu ngoặc, dấu phẩy và dấu nháy."
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
          className="font-mono text-sm"
        />
      ) : (
        <TextField
          id={`${fieldId}-value`}
          type={kind === "number" ? "number" : "text"}
          label={kind === "number" ? "Giá trị số" : "Giá trị hiển thị"}
          description={kind === "number" ? "Nhập số không kèm đơn vị hoặc ký hiệu." : undefined}
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
        />
      )}

      <details className="rounded-xl bg-[#f7f3eb] p-3 text-xs text-[#6f6558]">
        <summary className="cursor-pointer font-black text-[#4f463b]">
          Thông tin dành cho đội kỹ thuật
        </summary>
        <p className="mt-2 font-mono break-all">Mã cấu hình: {item.key}</p>
        <p className="mt-1">Cập nhật gần nhất: {new Date(item.updatedAt).toLocaleString("vi-VN")}</p>
      </details>

      <FormStatus status={status} message={statusMessage} />
      <SubmitButton pending={mutation.isPending} pendingLabel="Đang lưu cấu hình..." className="w-auto">
        Lưu thay đổi
      </SubmitButton>
    </form>
  );
}
