"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { contentApi } from "@/api/content";
import { CheckboxField, FormStatus, SubmitButton, TextareaField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import type { ContentValue } from "@/content/types";
import { jsonTextSchema } from "@/lib/json-form";
import { queryKeys } from "@/lib/query/keys";

export type ContentEntryItem = {
  namespace: string;
  key: string;
  locale: string;
  value: ContentValue;
  description: string;
  active: boolean;
  source: "default" | "database";
};
type FormValues = { text: string; active: boolean };

function serializeContentValue(value: ContentValue) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function parseContentValue(text: string, original: ContentValue): ContentValue {
  return typeof original === "string" ? text : (JSON.parse(text) as ContentValue);
}

export function ContentEntryForm({
  item,
  canEdit,
  interactive,
  onSaved,
}: {
  item: ContentEntryItem;
  canEdit: boolean;
  interactive: boolean;
  onSaved: (value: ContentValue, active: boolean) => void;
}) {
  const content = useContent("admin");
  const queryClient = useQueryClient();
  const textSchema =
    typeof item.value === "string"
      ? z.string().trim().min(1, "Nội dung không được để trống")
      : jsonTextSchema;
  const form = useForm<FormValues>({
    resolver: zodResolver(z.object({ text: textSchema, active: z.boolean() })),
    defaultValues: { text: serializeContentValue(item.value), active: item.active },
  });
  const mutation = useMutation({
    mutationFn: ({ text, active }: FormValues) => {
      const value = parseContentValue(text, item.value);
      return contentApi
        .update({
          namespace: item.namespace,
          key: item.key,
          locale: item.locale,
          value,
          description: item.description,
          active,
        })
        .then(() => ({ value, active }));
    },
    onSuccess: async ({ value, active }) => {
      onSaved(value, active);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.content }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.namespace(item.namespace, item.locale),
        }),
      ]);
      toast.success("Đã lưu nội dung hiển thị");
    },
  });

  const status = mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle";
  const statusMessage = mutation.isError
    ? mutation.error.message
    : mutation.isSuccess
      ? "Nội dung đã được cập nhật"
      : undefined;

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="mt-4 space-y-3"
      aria-busy={!interactive || mutation.isPending}
      noValidate
    >
      <TextareaField
        label="Nội dung hiển thị"
        description={
          typeof item.value === "string"
            ? "Nhập câu chữ người dùng sẽ nhìn thấy."
            : "Nội dung này có cấu trúc nâng cao; giữ nguyên dấu ngoặc và dấu phẩy."
        }
        rows={typeof item.value === "string" ? 4 : 6}
        disabled={!canEdit || !interactive}
        placeholder={contentText(content, "content.valuePlaceholder", "Nhập nội dung hiển thị")}
        registration={form.register("text")}
        error={form.formState.errors.text?.message}
        className={
          typeof item.value === "string"
            ? "text-sm disabled:bg-[#f7f3eb]"
            : "font-mono text-sm disabled:bg-[#f7f3eb]"
        }
      />
      <CheckboxField
        label={contentText(content, "content.active", "Đang sử dụng")}
        registration={form.register("active")}
        disabled={!canEdit || !interactive}
      />
      <FormStatus status={status} message={statusMessage} />
      {canEdit ? (
        <SubmitButton
          pending={mutation.isPending}
          disabled={!interactive}
          pendingLabel={contentText(content, "content.saving", "Đang lưu...")}
        >
          {contentText(content, "content.save", "Lưu nội dung")}
        </SubmitButton>
      ) : null}
    </form>
  );
}
