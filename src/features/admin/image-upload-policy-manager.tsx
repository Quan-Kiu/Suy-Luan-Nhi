"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ImageIcon, RotateCcw } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { systemSettingsApi } from "@/api/admin/settings";
import { CheckboxField, FormStatus, SubmitButton } from "@/components/form";
import {
  defaultImageUploadPolicies,
  imageUploadCategories,
  imageUploadPoliciesSchema,
  imageUploadPolicyLabels,
  mediaUploadPolicySettingKey,
  type ImageUploadPolicies,
} from "@/domain/media-upload-policy";
import { queryKeys } from "@/lib/query/keys";

const numberInputClass =
  "mt-1 min-h-11 w-full rounded-xl border border-[#d9c9ae] bg-white px-3 type-body outline-none focus:border-[#e9641a] focus:ring-2 focus:ring-[#e9641a]/20";

export function ImageUploadPolicyManager({ initialPolicies }: { initialPolicies: ImageUploadPolicies }) {
  const queryClient = useQueryClient();
  const form = useForm<ImageUploadPolicies>({
    resolver: zodResolver(imageUploadPoliciesSchema),
    defaultValues: initialPolicies,
  });
  const policyValues = useWatch({ control: form.control, defaultValue: initialPolicies });
  const mutation = useMutation({
    mutationFn: (values: ImageUploadPolicies) => systemSettingsApi.save(mediaUploadPolicySettingKey, values),
    onSuccess: async (saved) => {
      const policies = imageUploadPoliciesSchema.parse(saved.value);
      form.reset(policies);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.mediaUploadPolicies });
      toast.success("Đã lưu giới hạn tải ảnh");
    },
  });
  const status = mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle";
  const statusMessage = mutation.isError
    ? mutation.error.message
    : mutation.isSuccess
      ? "Các màn hình tải ảnh sẽ dùng giới hạn mới."
      : undefined;

  return (
    <section className="rounded-3xl border border-[#e5d8c2] bg-white p-5 shadow-[0_8px_24px_rgba(76,55,31,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
            <ImageIcon size={19} />
          </span>
          <div>
            <h2 className="type-card-title">Giới hạn tải ảnh theo từng nội dung</h2>
            <p className="type-supporting mt-1 max-w-3xl text-[#6f6558]">
              Mặc định mỗi ảnh tối đa 5MB. Có thể bật kiểm tra kích thước riêng cho ảnh bìa nhiệm vụ, chủ đề,
              câu hỏi và bài viết.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => form.reset(defaultImageUploadPolicies)}
          className="type-action inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 hover:bg-[#fff7eb]"
        >
          <RotateCcw size={16} /> Khôi phục mặc định
        </button>
      </div>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="mt-5 space-y-5">
        <div className="grid gap-4 xl:grid-cols-2">
          {imageUploadCategories.map((category) => {
            const sizeEnabled = policyValues[category]?.sizeValidationEnabled ?? true;
            const dimensionsEnabled = policyValues[category]?.dimensionValidationEnabled ?? false;
            const errors = form.formState.errors[category];
            const nullableNumber = {
              setValueAs: (value: unknown) =>
                value === "" || value === null || value === undefined || Number.isNaN(value)
                  ? null
                  : Number(value),
            };
            return (
              <details
                key={category}
                className="group overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fffdf9]"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:hidden">
                  <div className="min-w-0">
                    <h3 className="type-card-title text-[#342f28]">{imageUploadPolicyLabels[category]}</h3>
                    <p className="type-caption mt-1 text-[#6f6558]">
                      {sizeEnabled ? `${policyValues[category]?.maxSizeMb ?? 5}MB` : "Không giới hạn riêng"}
                      {" · "}
                      {dimensionsEnabled ? "Có kiểm tra kích thước" : "Không kiểm tra kích thước"}
                    </p>
                  </div>
                  <ChevronDown size={18} className="shrink-0 transition group-open:rotate-180" />
                </summary>
                <fieldset
                  aria-label={imageUploadPolicyLabels[category]}
                  className="border-t border-[#eadfce] p-4"
                >
                  <legend className="sr-only">{imageUploadPolicyLabels[category]}</legend>
                  <div className="space-y-4">
                    <CheckboxField
                      label="Kiểm tra dung lượng ảnh"
                      description="Tắt để bỏ giới hạn riêng của mục này. Hệ thống vẫn giữ mức an toàn tối đa 10MB."
                      registration={form.register(`${category}.sizeValidationEnabled`)}
                    />
                    <label className="type-label block font-bold text-[#342f28]">
                      Dung lượng tối đa (MB)
                      <input
                        type="number"
                        min={1}
                        max={10}
                        readOnly={!sizeEnabled}
                        aria-disabled={!sizeEnabled}
                        className={`${numberInputClass} ${!sizeEnabled ? "cursor-not-allowed opacity-60" : ""}`}
                        {...form.register(`${category}.maxSizeMb`, { valueAsNumber: true })}
                      />
                      {errors?.maxSizeMb?.message ? (
                        <span role="alert" className="type-caption mt-1 block font-bold text-red-700">
                          {errors.maxSizeMb.message}
                        </span>
                      ) : null}
                    </label>
                    <CheckboxField
                      label="Kiểm tra chiều rộng và chiều cao"
                      description="Bật khi ảnh cần đúng khoảng kích thước để không bị vỡ hoặc cắt xấu."
                      registration={form.register(`${category}.dimensionValidationEnabled`)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        [
                          ["minWidth", "Rộng tối thiểu"],
                          ["maxWidth", "Rộng tối đa"],
                          ["minHeight", "Cao tối thiểu"],
                          ["maxHeight", "Cao tối đa"],
                        ] as const
                      ).map(([field, label]) => (
                        <label key={field} className="type-caption block font-bold text-[#4f463b]">
                          {label} (px)
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            placeholder="Không giới hạn"
                            readOnly={!dimensionsEnabled}
                            aria-disabled={!dimensionsEnabled}
                            className={`${numberInputClass} ${!dimensionsEnabled ? "cursor-not-allowed opacity-60" : ""}`}
                            {...form.register(`${category}.${field}`, nullableNumber)}
                          />
                          {errors?.[field]?.message ? (
                            <span role="alert" className="mt-1 block font-bold text-red-700">
                              {errors[field]?.message}
                            </span>
                          ) : null}
                        </label>
                      ))}
                    </div>
                  </div>
                </fieldset>
              </details>
            );
          })}
        </div>
        <FormStatus status={status} message={statusMessage} />
        <SubmitButton pending={mutation.isPending} pendingLabel="Đang lưu..." className="w-auto">
          Lưu giới hạn tải ảnh
        </SubmitButton>
      </form>
    </section>
  );
}
