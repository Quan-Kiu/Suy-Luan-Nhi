"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Settings2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { getManagedSystemSettingDefinition } from "@/domain/system-settings";
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
  const definition = getManagedSystemSettingDefinition(item.key);
  const kind = definition?.kind ?? getSystemSettingKind(item.value);
  const fieldId = `setting-${item.key.replace(/[^a-zA-Z0-9_-]+/g, "-")}`;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: serializeSystemSetting(item.value, kind),
      enabled: kind === "boolean" ? Boolean(item.value) : false,
    },
  });
  const enabled = useWatch({ control: form.control, name: "enabled" });
  const mutation = useMutation({
    mutationFn: ({ text, enabled }: FormValues) =>
      systemSettingsApi.save(item.key, parseSystemSetting(kind, text, enabled)),
    onSuccess: (saved) => {
      form.reset({
        text: serializeSystemSetting(saved.value, kind),
        enabled: kind === "boolean" ? Boolean(saved.value) : false,
      });
      onSaved(saved);
      toast.success("Đã lưu cài đặt");
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
      ) : definition?.input === "textarea" || kind === "structured" ? (
        <TextareaField
          id={`${fieldId}-structured`}
          label={kind === "structured" ? "Nội dung nâng cao" : "Nội dung hiển thị"}
          rows={kind === "structured" ? 7 : 4}
          description={kind === "structured" ? "Giữ đúng dấu ngoặc, dấu phẩy và dấu nháy." : undefined}
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
          className={kind === "structured" ? "font-mono text-sm" : undefined}
        />
      ) : (
        <TextField
          id={`${fieldId}-value`}
          type={kind === "number" ? "number" : "text"}
          min={definition?.min}
          max={definition?.max}
          label={
            kind === "number"
              ? `Giá trị${definition?.unit ? ` (${definition.unit})` : ""}`
              : "Nội dung hiển thị"
          }
          description={
            kind === "number"
              ? `Nhập số từ ${definition?.min ?? 0} đến ${definition?.max ?? "giới hạn cho phép"}.`
              : undefined
          }
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
        />
      )}

      {definition?.danger && enabled ? (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
          <AlertTriangle className="mt-0.5 shrink-0" size={19} />
          <p>
            <strong>Thao tác ảnh hưởng toàn hệ thống.</strong> Người dùng đang ở khu vực phụ huynh hoặc chế độ
            bé sẽ được chuyển sang trang bảo trì ở yêu cầu tiếp theo.
          </p>
        </div>
      ) : null}

      <details className="rounded-xl bg-[#f7f3eb] p-3 text-xs text-[#6f6558]">
        <summary className="cursor-pointer font-black text-[#4f463b]">
          Thông tin dành cho đội kỹ thuật
        </summary>
        <p className="mt-2 font-mono break-all">Mã cài đặt: {item.key}</p>
        <p className="mt-1">
          {item.updatedAt
            ? `Cập nhật gần nhất: ${new Date(item.updatedAt).toLocaleString("vi-VN")}`
            : "Đang dùng giá trị mặc định an toàn của hệ thống."}
        </p>
      </details>

      <FormStatus status={status} message={statusMessage} />
      <SubmitButton pending={mutation.isPending} pendingLabel="Đang lưu..." className="w-auto">
        Lưu thay đổi
      </SubmitButton>
    </form>
  );
}
