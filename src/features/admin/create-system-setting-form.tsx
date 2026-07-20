"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { systemSettingsApi, type SystemSetting } from "@/api/admin/settings";
import {
  ControlledCheckboxField,
  FormStatus,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import {
  parseSystemSetting,
  systemSettingKindLabels,
  systemSettingKinds,
} from "@/domain/system-setting-presentation";

const schema = z.object({
  key: z
    .string()
    .trim()
    .min(3, "Mã cấu hình cần ít nhất 3 ký tự")
    .regex(/^[a-z0-9_.-]+$/, "Mã chỉ gồm chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới"),
  kind: z.enum(systemSettingKinds),
  text: z.string(),
  enabled: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

const kindOptions = systemSettingKinds.map((value) => ({
  value,
  label: systemSettingKindLabels[value],
}));

export function CreateSystemSettingForm({ onCreated }: { onCreated: (item: SystemSetting) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { key: "", kind: "boolean", text: "", enabled: true },
  });
  const kind = useWatch({ control: form.control, name: "kind" });
  const mutation = useMutation({
    mutationFn: ({ key, kind, text, enabled }: FormValues) =>
      systemSettingsApi.save(key, parseSystemSetting(kind, text, enabled)),
    onSuccess: (saved) => {
      onCreated(saved);
      form.reset({ key: "", kind: "boolean", text: "", enabled: true });
      toast.success("Đã thêm cấu hình hệ thống");
    },
  });
  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
          <Plus size={19} />
        </span>
        <div>
          <h2 className="font-black text-[#342f28]">Thêm cấu hình mới</h2>
          <p className="mt-1 text-sm leading-6 text-[#6f6558]">
            Chọn dạng giá trị trước. Mã kỹ thuật được đặt trong phần nâng cao để tránh nhập nhầm.
          </p>
        </div>
      </div>

      <SelectField
        id="new-setting-kind"
        label="Dạng cấu hình"
        description="Chọn cách người quản trị sẽ nhập và hiểu giá trị này."
        registration={form.register("kind")}
        options={kindOptions}
        error={form.formState.errors.kind?.message}
      />

      {kind === "boolean" ? (
        <ControlledCheckboxField
          id="new-setting-enabled"
          control={form.control}
          name="enabled"
          label="Bật ngay sau khi tạo"
          description="Bỏ chọn nếu cấu hình mới cần ở trạng thái tắt."
        />
      ) : kind === "structured" ? (
        <TextareaField
          id="new-setting-structured-value"
          label="Nội dung nâng cao"
          rows={7}
          placeholder='Ví dụ: { "limit": 10 }'
          description="Chỉ dùng khi một cấu hình cần nhiều giá trị liên quan."
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
          className="font-mono text-sm"
        />
      ) : (
        <TextField
          id="new-setting-value"
          type={kind === "number" ? "number" : "text"}
          label={kind === "number" ? "Giá trị số" : "Giá trị hiển thị"}
          placeholder={kind === "number" ? "Ví dụ: 10" : "Nhập giá trị"}
          registration={form.register("text")}
          error={form.formState.errors.text?.message}
        />
      )}

      <details className="rounded-2xl bg-[#f5f2ec] p-4">
        <summary className="cursor-pointer text-sm font-black text-[#4f463b]">Thiết lập nâng cao</summary>
        <div className="mt-3">
          <TextField
            id="new-setting-key"
            label="Mã cấu hình"
            placeholder="features.exampleEnabled"
            description="Mã phải khớp với phần hệ thống sẽ đọc cấu hình này. Không đổi sau khi đã sử dụng."
            registration={form.register("key")}
            error={form.formState.errors.key?.message}
          />
        </div>
      </details>

      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton pending={mutation.isPending} pendingLabel="Đang thêm cấu hình..." className="w-auto">
        Thêm cấu hình
      </SubmitButton>
    </form>
  );
}
