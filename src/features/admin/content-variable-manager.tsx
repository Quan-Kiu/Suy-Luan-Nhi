"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Braces, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { systemSettingsApi } from "@/api/admin/settings";
import {
  CheckboxField,
  ControlledTextareaField,
  FormStatus,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { Card } from "@/components/ui";
import { queryKeys } from "@/lib/query/keys";
import {
  CONTENT_VARIABLES_SETTING_KEY,
  contentVariableDefinitionsSchema,
  contentVariableSourceOptions,
  parseContentVariableDefinitions,
  renderContentTemplatePreview,
  type ContentVariableDefinition,
} from "@/domain/content-variables";

const formSchema = z.object({ variables: contentVariableDefinitionsSchema });
type FormValues = z.infer<typeof formSchema>;

export function ContentVariableManager({ initial }: { initial: ContentVariableDefinition[] }) {
  const [previewText, setPreviewText] = useState("Yêu cầu {{name}} quan sát thật kỹ rồi chọn đáp án.");
  const [persistedCount, setPersistedCount] = useState(initial.length);
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { variables: initial },
    mode: "onChange",
  });
  const fields = useFieldArray({ control: form.control, name: "variables" });
  const variables = useWatch({ control: form.control, name: "variables" });
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      systemSettingsApi.save(CONTENT_VARIABLES_SETTING_KEY, values.variables),
    onSuccess: (saved) => {
      const next = parseContentVariableDefinitions(saved.value);
      form.reset({ variables: next });
      setPersistedCount(next.length);
      void queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      toast.success("Đã lưu cấu hình tag nội dung");
    },
  });

  return (
    <FormProvider {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <Card className="rounded-3xl border-[#dfd2bd] bg-[#fffaf0] p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
              <Braces size={21} />
            </span>
            <div>
              <h2 className="text-lg font-black">Cách dùng tag trong nội dung</h2>
              <p className="mt-1 text-sm leading-6 text-[#6f6558]">
                Người soạn gõ hai dấu ngoặc nhọn{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-bold">{"{{"}</code> để mở gợi ý, hoặc bấm
                “Chèn biến”. Dữ liệu thật chỉ được thay thế khi hiển thị cho bé.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ControlledTextareaField
              label="Nội dung thử"
              rows={3}
              value={previewText}
              onValueChange={setPreviewText}
              description="Dùng các tag đang cấu hình để xem kết quả mẫu."
            />
            <div className="grid content-start gap-2">
              <span className="font-bold">Kết quả xem trước</span>
              <div className="min-h-[96px] rounded-2xl border-2 border-[#eadfc9] bg-white px-4 py-3">
                <p className="leading-7 font-bold">{renderContentTemplatePreview(previewText, variables)}</p>
              </div>
              <span className="min-h-5 text-sm leading-5 font-normal text-[#806d54]">
                Tag được thay bằng dữ liệu xem trước của từng cấu hình.
              </span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {fields.fields.map((field, index) => {
            const error = form.formState.errors.variables?.[index];
            const persisted = index < persistedCount;
            return (
              <Card key={field.id} className="rounded-3xl p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black tracking-wider text-[#8a6b39] uppercase">
                      Tag {index + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-black">{`{{${variables[index]?.key || "tag_moi"}}}`}</h3>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <CheckboxField
                      label="Cho phép dùng tag này"
                      registration={form.register(`variables.${index}.enabled` as const)}
                    />
                    {!persisted ? (
                      <button
                        type="button"
                        onClick={() => fields.remove(index)}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-black text-red-700"
                      >
                        <Trash2 size={16} /> Bỏ tag mới
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <TextField
                    label="Tên tag"
                    placeholder="name"
                    description={
                      persisted
                        ? "Mã tag được khóa để nội dung đã tạo không bị hỏng."
                        : "Người soạn sẽ chèn theo dạng {{ten_tag}}."
                    }
                    disabled={persisted}
                    registration={form.register(`variables.${index}.key` as const)}
                    error={error?.key?.message}
                  />
                  <TextField
                    label="Tên dễ hiểu"
                    placeholder="Tên bé"
                    registration={form.register(`variables.${index}.label` as const)}
                    error={error?.label?.message}
                  />
                  <SelectField
                    label="Dữ liệu được lấy từ"
                    description="Chỉ các nguồn an toàn trong danh sách này mới được phép sử dụng."
                    registration={form.register(`variables.${index}.source` as const)}
                    options={contentVariableSourceOptions.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    error={error?.source?.message}
                  />
                  <TextField
                    label="Dữ liệu xem trước"
                    placeholder="Bống"
                    description="Hiển thị trong màn hình xem thử của người soạn."
                    registration={form.register(`variables.${index}.example` as const)}
                    error={error?.example?.message}
                  />
                  <TextField
                    label="Nội dung dự phòng"
                    placeholder="bé"
                    description="Dùng khi hồ sơ chưa có dữ liệu tương ứng."
                    registration={form.register(`variables.${index}.fallback` as const)}
                    error={error?.fallback?.message}
                  />
                  <TextareaField
                    label="Mô tả cho người soạn"
                    rows={3}
                    registration={form.register(`variables.${index}.description` as const)}
                    error={error?.description?.message}
                  />
                </div>
                {!variables[index]?.enabled ? (
                  <p className="mt-3 rounded-xl bg-[#f5f2ec] px-3 py-2 text-sm text-[#6f6558]">
                    Tag đang tắt nên sẽ không xuất hiện trong gợi ý khi viết nội dung. Nội dung cũ vẫn được
                    thay thế bằng dữ liệu hoặc giá trị dự phòng.
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() =>
            fields.append({
              key: "",
              label: "",
              description: "",
              source: "child.displayName",
              example: "Bống",
              fallback: "bé",
              enabled: true,
            })
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black"
        >
          <Plus size={18} /> Thêm tag mới
        </button>

        <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
        <div className="flex justify-end rounded-2xl border bg-white p-3 shadow-sm">
          <SubmitButton pending={mutation.isPending} pendingLabel="Đang lưu..." className="w-full sm:w-auto">
            Lưu cấu hình tag
          </SubmitButton>
        </div>
      </form>
    </FormProvider>
  );
}
