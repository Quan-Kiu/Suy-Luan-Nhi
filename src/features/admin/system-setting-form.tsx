"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { systemSettingsApi, type SystemSetting } from "@/api/admin/settings";
import { FormStatus, SubmitButton, TextareaField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { jsonTextSchema, parseJsonText } from "@/lib/json-form";

const schema = z.object({ text: jsonTextSchema });

type FormValues = z.infer<typeof schema>;

export function SystemSettingForm({
  item,
  onSaved,
}: {
  item: SystemSetting;
  onSaved: (item: SystemSetting) => void;
}) {
  const content = useContent("admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { text: JSON.stringify(item.value, null, 2) },
  });
  const mutation = useMutation({
    mutationFn: ({ text }: FormValues) => systemSettingsApi.save(item.key, parseJsonText(text)),
    onSuccess: (saved) => {
      form.reset({ text: JSON.stringify(saved.value, null, 2) });
      onSaved(saved);
      toast.success(contentText(content, "settings.saved", "Đã lưu system setting"));
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-3" noValidate>
      <strong>{item.key}</strong>
      <TextareaField
        label={contentText(content, "settings.jsonLabel", "Giá trị JSON")}
        rows={4}
        placeholder={contentText(content, "settings.jsonPlaceholder", "Nhập JSON hợp lệ")}
        registration={form.register("text")}
        error={form.formState.errors.text?.message}
        className="font-mono text-xs"
      />
      <FormStatus
        status={mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle"}
        message={
          mutation.isError
            ? mutation.error.message
            : mutation.isSuccess
              ? contentText(content, "settings.saved", "Đã lưu system setting")
              : undefined
        }
      />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "settings.saving", "Đang lưu...")}
        className="w-auto"
      >
        {contentText(content, "settings.save", "Lưu")}
      </SubmitButton>
    </form>
  );
}
