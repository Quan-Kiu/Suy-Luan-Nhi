"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Pencil, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { contentApi } from "@/api/content";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus, SubmitButton, TextareaField, TextField } from "@/components/form";
import type { ContentValue } from "@/content/types";
import {
  contentHasTemplateVariables,
  contentPreviewText,
  getContentLengthGuidance,
  getContentPurpose,
} from "@/domain/content-presentation";
import { jsonTextSchema } from "@/lib/json-form";
import { queryKeys } from "@/lib/query/keys";

export type ContentEntryItem = {
  namespace: string;
  key: string;
  locale: string;
  category: string;
  valueType: "text" | "number" | "boolean" | "json";
  value: ContentValue;
  defaultValue: ContentValue;
  hasDefault: boolean;
  description: string;
  active: boolean;
  source: "default" | "database";
};

type FormValues = { text: string };

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
  onReset,
}: {
  item: ContentEntryItem;
  canEdit: boolean;
  interactive: boolean;
  onSaved: (value: ContentValue) => void;
  onReset: (value: ContentValue) => void;
}) {
  const queryClient = useQueryClient();
  const fieldId = useId();
  const [resetOpen, setResetOpen] = useState(false);
  const purpose = getContentPurpose(item.key, item.value);
  const lengthGuidance = getContentLengthGuidance(item.key, item.value);
  const requiredVariables = contentHasTemplateVariables(item.hasDefault ? item.defaultValue : item.value);

  const textSchema =
    typeof item.value === "string"
      ? z
          .string()
          .trim()
          .min(1, "Nhập câu chữ người dùng sẽ nhìn thấy")
          .superRefine((value, context) => {
            for (const variable of requiredVariables) {
              if (!value.includes(`{${variable}}`)) {
                context.addIssue({
                  code: "custom",
                  message: `Giữ lại biến {${variable}} để hệ thống điền đúng thông tin`,
                });
              }
            }
          })
      : jsonTextSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(z.object({ text: textSchema })),
    defaultValues: { text: serializeContentValue(item.value) },
  });
  const text = useWatch({ control: form.control, name: "text" }) ?? "";

  const mutation = useMutation({
    mutationFn: ({ text: nextText }: FormValues) => {
      const value = parseContentValue(nextText, item.value);
      return contentApi
        .update({
          namespace: item.namespace,
          key: item.key,
          locale: item.locale,
          value,
          description: item.description,
          active: true,
        })
        .then(() => value);
    },
    onSuccess: async (value) => {
      form.reset({ text: serializeContentValue(value) });
      onSaved(value);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.content }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.namespace(item.namespace, item.locale),
        }),
      ]);
      toast.success("Đã cập nhật câu chữ hiển thị");
    },
  });
  const resetMutation = useMutation({
    mutationFn: () => contentApi.reset({ namespace: item.namespace, key: item.key, locale: item.locale }),
    onSuccess: async () => {
      if (item.hasDefault) {
        form.reset({ text: serializeContentValue(item.defaultValue) });
        onReset(item.defaultValue);
      }
      setResetOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.content }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.content.namespace(item.namespace, item.locale),
        }),
      ]);
      toast.success("Đã dùng lại nội dung mặc định");
    },
  });

  if (!canEdit) return null;

  const fieldDescription = [
    purpose.help,
    lengthGuidance ? `Nên ngắn hơn ${lengthGuidance} ký tự để dễ đọc trên điện thoại.` : null,
    requiredVariables.length
      ? `Giữ nguyên: ${requiredVariables.map((variable) => `{${variable}}`).join(", ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ");
  const fieldError = form.formState.errors.text?.message;
  const status = mutation.isError
    ? "error"
    : mutation.isSuccess
      ? "success"
      : resetMutation.isError
        ? "error"
        : "idle";
  const statusMessage = mutation.isError
    ? mutation.error.message
    : resetMutation.isError
      ? resetMutation.error.message
      : mutation.isSuccess
        ? "Nội dung mới đã sẵn sàng trên các màn hình liên quan."
        : undefined;

  return (
    <>
      <details className="group mt-4 overflow-hidden rounded-2xl border border-[#e5d8c2] bg-[#fffdf8]">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-black text-[#3f392f] marker:hidden">
          <span className="inline-flex items-center gap-2">
            <Pencil size={17} /> Chỉnh sửa câu chữ
          </span>
          <ChevronDown size={18} className="transition group-open:rotate-180" />
        </summary>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4 border-t border-[#eadfc9] p-4"
          aria-busy={!interactive || mutation.isPending || resetMutation.isPending}
          noValidate
        >
          {fieldError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <p className="font-black">Có nội dung cần kiểm tra</p>
              <a href={`#${fieldId}`} className="mt-1 inline-block font-bold underline">
                {fieldError}
              </a>
            </div>
          ) : null}

          {purpose.editor === "singleLine" ? (
            <TextField
              id={fieldId}
              label="Câu chữ người dùng sẽ nhìn thấy"
              description={fieldDescription}
              disabled={!interactive}
              registration={form.register("text")}
              error={fieldError}
            />
          ) : (
            <TextareaField
              id={fieldId}
              label={
                purpose.editor === "structured" ? "Nội dung có cấu trúc" : "Câu chữ người dùng sẽ nhìn thấy"
              }
              description={fieldDescription}
              rows={purpose.editor === "structured" ? 9 : 5}
              disabled={!interactive}
              registration={form.register("text")}
              error={fieldError}
              className={purpose.editor === "structured" ? "font-mono text-sm" : undefined}
            />
          )}

          {typeof item.value === "string" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#6f6558]">
              <span>{form.formState.isDirty ? "Có thay đổi chưa lưu" : "Chưa có thay đổi mới"}</span>
              <span className={lengthGuidance && text.length > lengthGuidance ? "text-amber-800" : undefined}>
                {text.length} ký tự{lengthGuidance ? ` · khuyên dùng tối đa ${lengthGuidance}` : ""}
              </span>
            </div>
          ) : null}

          {item.source === "database" && item.hasDefault ? (
            <div className="rounded-xl bg-[#f5f2ec] p-3">
              <p className="text-xs font-black tracking-wide text-[#756b60] uppercase">Nội dung mặc định</p>
              <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-[#4f463b]">
                {contentPreviewText(item.defaultValue)}
              </p>
            </div>
          ) : null}

          <FormStatus status={status} message={statusMessage} />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {item.source === "database" && item.hasDefault ? (
              <button
                type="button"
                disabled={!interactive || mutation.isPending || resetMutation.isPending}
                onClick={() => setResetOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-4 font-black text-[#5f5548] disabled:opacity-50"
              >
                <RotateCcw size={17} /> Dùng nội dung mặc định
              </button>
            ) : (
              <span />
            )}
            <SubmitButton
              pending={mutation.isPending}
              disabled={!interactive || !form.formState.isDirty}
              pendingLabel="Đang lưu thay đổi..."
            >
              Lưu câu chữ
            </SubmitButton>
          </div>
        </form>
      </details>

      <ConfirmDialog
        open={resetOpen}
        title="Dùng lại nội dung mặc định?"
        description="Nội dung đã tùy chỉnh sẽ được bỏ. Sản phẩm sẽ dùng lại câu chữ mặc định trong mã nguồn."
        confirmLabel="Dùng nội dung mặc định"
        pendingLabel="Đang khôi phục..."
        pending={resetMutation.isPending}
        onConfirm={() => resetMutation.mutate()}
        onClose={() => setResetOpen(false)}
      />
    </>
  );
}
