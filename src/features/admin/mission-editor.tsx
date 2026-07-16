"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  Eye,
  FileText,
  LayoutDashboard,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { QuestionRenderer } from "@/components/question-renderer";
import { Button, Card, Pill } from "@/components/ui";
import { defaultSafetyChecklist, footprintMission } from "@/domain/content";
import {
  isSafetyChecklistComplete,
  missionEditorSchema,
  type MissionEditorInput,
  type Question,
} from "@/domain/schemas";
import { requestJson } from "@/lib/http";

const checklistLabels: Record<keyof MissionEditorInput["safety"], string> = {
  ageAppropriate: "Độ tuổi phù hợp",
  hintsSupportive: "Có gợi ý và hỗ trợ",
  feedbackPositive: "Phản hồi tích cực",
  noProhibitedClaims: "Không tuyên bố bị cấm",
  noExternalLinks: "Không liên kết ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn",
};

const navigationItems = [
  { icon: LayoutDashboard, label: "Tổng quan" },
  { icon: FileText, label: "Nhiệm vụ", active: true },
  { icon: Eye, label: "Xem trước" },
  { icon: ShieldCheck, label: "Kiểm duyệt" },
  { icon: Users, label: "Thành viên" },
  { icon: Settings, label: "Cài đặt" },
];

type EditorAction = "save" | "submit";
type EditorStatus = "draft" | "in_review";
type SaveResponse = { savedAt: string; status: EditorStatus; publishReady: boolean };

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs font-bold text-red-700">{message}</span> : null;
}

export function MissionEditor() {
  const question = footprintMission.questions[0];
  const [status, setStatus] = useState<EditorStatus>("draft");
  const form = useForm<MissionEditorInput>({
    resolver: zodResolver(missionEditorSchema),
    mode: "onChange",
    defaultValues: {
      title: footprintMission.title,
      subtitle: footprintMission.subtitle,
      shortDescription: footprintMission.shortDescription,
      storyIntro: footprintMission.storyIntro,
      estimatedMinutes: footprintMission.estimatedMinutes,
      primarySkill: footprintMission.primarySkill,
      ageGroup: "4-5",
      coverImage: footprintMission.coverImage,
      rewardName: footprintMission.reward.name,
      prompt: question.prompt,
      instruction: question.instruction,
      sequence: question.sequence.map((item) => ({ ...item, asset: item.asset ?? "" })),
      options: question.options,
      correctAnswer: question.correctAnswer,
      hints: question.hints.map((text) => ({ text })),
      feedbackCorrect: question.feedbackCorrect,
      feedbackIncorrect: question.feedbackIncorrect,
      safety: defaultSafetyChecklist,
    },
  });
  const sequenceFields = useFieldArray({ control: form.control, name: "sequence", keyName: "fieldKey" });
  const optionFields = useFieldArray({ control: form.control, name: "options", keyName: "fieldKey" });
  const hintFields = useFieldArray({ control: form.control, name: "hints", keyName: "fieldKey" });
  const values = useWatch({ control: form.control });
  const safetyValues = { ...defaultSafetyChecklist, ...(values.safety ?? {}) };
  const allSafe = isSafetyChecklistComplete(safetyValues);
  const publishReady = allSafe && form.formState.isValid;
  const previewTitle = values.title ?? footprintMission.title;
  const previewQuestion: Question = {
    ...question,
    prompt: values.prompt ?? question.prompt,
    instruction: values.instruction ?? question.instruction,
    sequence: (values.sequence ?? question.sequence).map((item, index) => ({
      id: item?.id ?? question.sequence[index]?.id ?? `sequence-${index}`,
      label: item?.label ?? question.sequence[index]?.label ?? `Mảnh ${index + 1}`,
      asset: item?.asset ? item.asset : null,
    })),
    options: (values.options ?? question.options).map((option, index) => ({
      id: option?.id ?? question.options[index]?.id ?? `option-${index}`,
      label: option?.label ?? question.options[index]?.label ?? `Đáp án ${index + 1}`,
      asset: option?.asset || question.options[index]?.asset || "/assets/gameplay/puzzle-item-blue-star.png",
    })),
    correctAnswer: values.correctAnswer ?? question.correctAnswer,
    hints: (values.hints ?? question.hints.map((text) => ({ text }))).map((hint) => hint?.text ?? ""),
    feedbackCorrect: values.feedbackCorrect ?? question.feedbackCorrect,
    feedbackIncorrect: values.feedbackIncorrect ?? question.feedbackIncorrect,
  };
  const mutation = useMutation({
    mutationFn: ({ mission, action }: { mission: MissionEditorInput; action: EditorAction }) =>
      requestJson<SaveResponse>("/api/admin/missions", {
        method: "PUT",
        body: JSON.stringify({ mission, action }),
      }),
    onSuccess: (data) => {
      setStatus(data.status);
      toast.success(
        data.status === "in_review" ? "Đã gửi nhiệm vụ để kiểm duyệt" : "Đã lưu bản nháp nhiệm vụ",
      );
    },
    onError: (error) => toast.error(error.message),
  });
  const inputClass =
    "min-h-11 w-full rounded-xl border border-[#ddd7ca] bg-white px-3 text-sm focus:border-[#e9641a]";
  const saveDraft = form.handleSubmit((mission) => mutation.mutate({ mission, action: "save" }));
  const submitForReview = form.handleSubmit((mission) => mutation.mutate({ mission, action: "submit" }));

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#342f28]">
      <header className="flex h-16 items-center justify-between border-b bg-white px-5">
        <div className="flex items-center gap-3">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={982}
            height={1035}
            alt="Suy Luận Nhí"
            className="h-[42px] w-auto object-contain"
          />
          <div>
            <p className="font-black">Suy Luận Nhí CMS</p>
            <p className="text-xs text-[#7d7468]">Quản trị nội dung an toàn</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Pill>{status === "in_review" ? "Đang kiểm duyệt" : "Bản nháp"}</Pill>
          <Button
            type="button"
            onClick={saveDraft}
            disabled={mutation.isPending}
            className="min-h-10 rounded-xl px-4 py-2 text-sm shadow-[0_4px_0_#bd4910]"
          >
            <Save size={16} className="mr-2 inline" /> Lưu
          </Button>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_370px]">
        <aside className="border-r bg-white p-4">
          <nav className="space-y-1 text-sm font-bold">
            {navigationItems.map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                type="button"
                disabled={!active}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${active ? "bg-[#fff0df] text-[#d95812]" : "opacity-60"}`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </nav>
          <div className="mt-10 rounded-2xl bg-[#f7f2e8] p-3 text-xs">
            <p className="font-black">Mẹo từ Bống</p>
            <p className="mt-1 text-[#746b60]">
              Preview dùng cùng Child Renderer nên nội dung xuất bản sẽ giống trải nghiệm của bé.
            </p>
          </div>
        </aside>

        <main className="min-w-0 p-5 lg:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#8a8176]">Nhiệm vụ / Thám tử Quy luật / Chỉnh sửa</p>
              <h1 className="mt-1 text-2xl font-black">{previewTitle || "Nhiệm vụ mới"}</h1>
            </div>
            <div className="hidden gap-2 md:flex">
              <Pill>Nội dung</Pill>
              <Pill>Cấu hình</Pill>
              <Pill>Phương tiện</Pill>
              <Pill>Lịch sử duyệt</Pill>
            </div>
          </div>
          <form className="space-y-5" onSubmit={saveDraft} noValidate>
            <Card className="rounded-2xl p-5 shadow-sm">
              <h2 className="font-black">1. Thông tin cơ bản</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold">
                  Tiêu đề
                  <input className={inputClass} {...form.register("title")} />
                  <FieldError message={form.formState.errors.title?.message} />
                </label>
                <label className="text-sm font-bold">
                  Phụ đề
                  <input className={inputClass} {...form.register("subtitle")} />
                  <FieldError message={form.formState.errors.subtitle?.message} />
                </label>
                <label className="text-sm font-bold md:col-span-2">
                  Mô tả ngắn
                  <input className={inputClass} {...form.register("shortDescription")} />
                  <FieldError message={form.formState.errors.shortDescription?.message} />
                </label>
                <label className="text-sm font-bold">
                  Nhóm tuổi
                  <select className={inputClass} {...form.register("ageGroup")}>
                    <option value="2-3">2–3 tuổi</option>
                    <option value="4-5">4–5 tuổi</option>
                    <option value="6-8">6–8 tuổi</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Kỹ năng chính
                  <input className={inputClass} {...form.register("primarySkill")} />
                  <FieldError message={form.formState.errors.primarySkill?.message} />
                </label>
                <label className="text-sm font-bold">
                  Thời gian (phút)
                  <input
                    type="number"
                    className={inputClass}
                    {...form.register("estimatedMinutes", { valueAsNumber: true })}
                  />
                  <FieldError message={form.formState.errors.estimatedMinutes?.message} />
                </label>
                <label className="text-sm font-bold md:col-span-2">
                  Ảnh bìa
                  <input className={inputClass} {...form.register("coverImage")} />
                  <FieldError message={form.formState.errors.coverImage?.message} />
                </label>
                <label className="text-sm font-bold md:col-span-2">
                  Tên phần thưởng
                  <input className={inputClass} {...form.register("rewardName")} />
                  <FieldError message={form.formState.errors.rewardName?.message} />
                </label>
              </div>
            </Card>

            <Card className="rounded-2xl p-5 shadow-sm">
              <h2 className="font-black">2. Nội dung nhiệm vụ</h2>
              <label className="mt-4 block text-sm font-bold">
                Câu chuyện dẫn dắt
                <textarea rows={4} className={`${inputClass} py-3`} {...form.register("storyIntro")} />
                <FieldError message={form.formState.errors.storyIntro?.message} />
              </label>
              <div className="mt-4 rounded-2xl border border-[#e7dfd2] bg-[#faf8f4] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-black">Câu hỏi 1 · Pattern Sequence</p>
                  <Pill>Đang dùng</Pill>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-bold md:col-span-2">
                    Câu hỏi
                    <input className={inputClass} {...form.register("prompt")} />
                    <FieldError message={form.formState.errors.prompt?.message} />
                  </label>
                  <label className="text-sm font-bold md:col-span-2">
                    Hướng dẫn
                    <input className={inputClass} {...form.register("instruction")} />
                    <FieldError message={form.formState.errors.instruction?.message} />
                  </label>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">Chuỗi hình theo thứ tự</p>
                    <button
                      type="button"
                      onClick={() =>
                        sequenceFields.append({
                          id: `sequence-${crypto.randomUUID()}`,
                          label: "Mảnh mới",
                          asset: "",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold"
                    >
                      <Plus size={14} /> Thêm mảnh
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {sequenceFields.fields.map((field, index) => (
                      <div
                        key={field.fieldKey}
                        className="grid grid-cols-[1fr_1.5fr_auto] gap-2 rounded-xl border bg-white p-2"
                      >
                        <input
                          aria-label={`Tên mảnh ${index + 1}`}
                          className={inputClass}
                          {...form.register(`sequence.${index}.label`)}
                        />
                        <input
                          aria-label={`Asset mảnh ${index + 1}`}
                          placeholder="Để trống cho ô ?"
                          className={inputClass}
                          {...form.register(`sequence.${index}.asset`)}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Đưa mảnh ${index + 1} lên`}
                            disabled={index === 0}
                            onClick={() => sequenceFields.move(index, index - 1)}
                            className="rounded-lg border p-2 disabled:opacity-30"
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Đưa mảnh ${index + 1} xuống`}
                            disabled={index === sequenceFields.fields.length - 1}
                            onClick={() => sequenceFields.move(index, index + 1)}
                            className="rounded-lg border p-2 disabled:opacity-30"
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Xóa mảnh ${index + 1}`}
                            disabled={sequenceFields.fields.length <= 3}
                            onClick={() => sequenceFields.remove(index)}
                            className="rounded-lg border p-2 text-red-700 disabled:opacity-30"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <input type="hidden" {...form.register(`sequence.${index}.id`)} />
                      </div>
                    ))}
                  </div>
                  <FieldError message={form.formState.errors.sequence?.root?.message} />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">Các lựa chọn</p>
                    <button
                      type="button"
                      onClick={() =>
                        optionFields.append({
                          id: `option-${crypto.randomUUID()}`,
                          label: "Đáp án mới",
                          asset: "/assets/gameplay/puzzle-item-blue-star.png",
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold"
                    >
                      <Plus size={14} /> Thêm đáp án
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {optionFields.fields.map((field, index) => (
                      <div
                        key={field.fieldKey}
                        className="grid grid-cols-[1fr_1.5fr_auto] gap-2 rounded-xl border bg-white p-2"
                      >
                        <input
                          aria-label={`Tên đáp án ${index + 1}`}
                          className={inputClass}
                          {...form.register(`options.${index}.label`)}
                        />
                        <input
                          aria-label={`Asset đáp án ${index + 1}`}
                          className={inputClass}
                          {...form.register(`options.${index}.asset`)}
                        />
                        <button
                          type="button"
                          aria-label={`Xóa đáp án ${index + 1}`}
                          disabled={optionFields.fields.length <= 2}
                          onClick={() => optionFields.remove(index)}
                          className="rounded-lg border p-2 text-red-700 disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                        <input type="hidden" {...form.register(`options.${index}.id`)} />
                      </div>
                    ))}
                  </div>
                </div>

                <label className="mt-4 block text-sm font-bold">
                  Đáp án đúng
                  <select className={inputClass} {...form.register("correctAnswer")}>
                    {(values.options ?? []).map((option, index) => (
                      <option key={option?.id ?? index} value={option?.id}>
                        {option?.label ?? `Đáp án ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <FieldError message={form.formState.errors.correctAnswer?.message} />
                </label>

                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">Gợi ý theo cấp độ</p>
                    <button
                      type="button"
                      onClick={() => hintFields.append({ text: "Gợi ý mới" })}
                      className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold"
                    >
                      <Plus size={14} /> Thêm gợi ý
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {hintFields.fields.map((field, index) => (
                      <div key={field.fieldKey} className="flex gap-2">
                        <textarea
                          aria-label={`Gợi ý ${index + 1}`}
                          rows={2}
                          className={`${inputClass} py-2`}
                          {...form.register(`hints.${index}.text`)}
                        />
                        <button
                          type="button"
                          aria-label={`Xóa gợi ý ${index + 1}`}
                          disabled={hintFields.fields.length <= 1}
                          onClick={() => hintFields.remove(index)}
                          className="self-start rounded-lg border p-2 text-red-700 disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-bold">
                    Phản hồi đúng
                    <textarea
                      rows={3}
                      className={`${inputClass} py-2`}
                      {...form.register("feedbackCorrect")}
                    />
                    <FieldError message={form.formState.errors.feedbackCorrect?.message} />
                  </label>
                  <label className="text-sm font-bold">
                    Phản hồi chưa đúng
                    <textarea
                      rows={3}
                      className={`${inputClass} py-2`}
                      {...form.register("feedbackIncorrect")}
                    />
                    <FieldError message={form.formState.errors.feedbackIncorrect?.message} />
                  </label>
                </div>
              </div>
            </Card>

            <Card className="rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-black">3. Checklist an toàn</h2>
                <Pill
                  className={
                    allSafe
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  {allSafe ? <Check size={16} /> : <CircleAlert size={16} />}{" "}
                  {allSafe ? "Đạt 100%" : "Chưa hoàn tất"}
                </Pill>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(Object.keys(checklistLabels) as (keyof MissionEditorInput["safety"])[]).map((key) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e6ded1] bg-white p-3 text-sm font-bold"
                  >
                    <input
                      type="checkbox"
                      className="size-5 accent-[#5f8d49]"
                      {...form.register(`safety.${key}`)}
                    />
                    {checklistLabels[key]}
                  </label>
                ))}
              </div>
            </Card>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Lưu bản nháp"}
            </Button>
          </form>
        </main>

        <aside className="hidden border-l bg-white p-5 xl:block">
          <div className="sticky top-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Preview chế độ bé</h2>
              <Pill>Mobile</Pill>
            </div>
            <div className="mx-auto w-[320px] overflow-hidden rounded-[38px] border-[9px] border-[#292620] bg-[#fffaf0] shadow-2xl">
              <div className="h-5 bg-[#292620]" />
              <div className="p-4">
                <p className="text-center text-xs font-black tracking-widest text-[#d78517] uppercase">
                  Thám tử Quy luật
                </p>
                <h3 className="mt-1 text-center text-xl font-black">{previewQuestion.prompt}</h3>
                <p className="mt-1 mb-4 text-center text-xs text-[#806d54]">{previewQuestion.instruction}</p>
                <QuestionRenderer question={previewQuestion} compact disabled />
                <div className="mt-4 rounded-xl bg-[#edf4df] p-3 text-xs font-bold text-[#537043]">
                  Preview này dùng đúng module gameplay của bé.
                </div>
              </div>
            </div>
            <Card className="mt-5 rounded-2xl p-4 shadow-sm">
              <p className="font-black">Khả năng xuất bản</p>
              <p className="mt-2 text-sm text-[#746b60]">
                {publishReady
                  ? "Nội dung và Checklist đã hoàn tất. Có thể gửi reviewer kiểm duyệt."
                  : "Sửa các trường chưa hợp lệ và hoàn tất Checklist trước khi gửi duyệt."}
              </p>
              <button
                type="button"
                onClick={submitForReview}
                disabled={!publishReady || mutation.isPending}
                className="mt-3 min-h-10 w-full rounded-xl bg-[#5d8c48] font-black text-white disabled:opacity-40"
              >
                {mutation.isPending ? "Đang gửi..." : "Gửi duyệt"}
              </button>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
