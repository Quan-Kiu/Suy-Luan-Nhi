"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { systemSettingsApi, type SystemSetting } from "@/api/admin/settings";
import { FormStatus, SubmitButton, TextareaField, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { jsonTextSchema, parseJsonText } from "@/lib/json-form";

const schema = z.object({ key: z.string().trim().min(3, "Key cần ít nhất 3 ký tự"), text: jsonTextSchema });
type FormValues = z.infer<typeof schema>;

export function CreateSystemSettingForm({ onCreated }: { onCreated: (item: SystemSetting) => void }) {
  const content = useContent("admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { key: "", text: "true" },
  });
  const mutation = useMutation({
    mutationFn: ({ key, text }: FormValues) => systemSettingsApi.save(key, parseJsonText(text)),
    onSuccess: (saved) => {
      onCreated(saved);
      form.reset({ key: "", text: "true" });
      toast.success(contentText(content, "settings.saved", "Đã lưu system setting"));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-3" noValidate>
      <h2 className="font-black">{contentText(content, "settings.createTitle", "Thêm setting")}</h2>
      <TextField
        label={contentText(content, "settings.keyLabel", "Setting key")}
        placeholder={contentText(content, "settings.keyPlaceholder", "key.ví_dụ")}
        registration={form.register("key")}
        error={form.formState.errors.key?.message}
      />
      <TextareaField
        label={contentText(content, "settings.jsonLabel", "Giá trị JSON")}
        rows={4}
        registration={form.register("text")}
        error={form.formState.errors.text?.message}
        className="font-mono text-xs"
      />
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "settings.saving", "Đang lưu...")}
        className="w-auto"
      >
        {contentText(content, "settings.create", "Thêm setting")}
      </SubmitButton>
    </form>
  );
}
