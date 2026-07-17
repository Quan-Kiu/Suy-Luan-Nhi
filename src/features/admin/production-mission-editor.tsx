"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { adminMissionsApi } from "@/api/admin/missions";
import { FormStatus } from "@/components/form";
import { Button } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { MissionBasicFields } from "@/features/admin/mission-editor/basic-fields";
import { MissionEditorPreview } from "@/features/admin/mission-editor/preview";
import { MissionQuestionsSection } from "@/features/admin/mission-editor/questions-section";
import { MissionSafetySection } from "@/features/admin/mission-editor/safety-section";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import { queryKeys } from "@/lib/query/keys";
import { adminMissionDraftSchema, type AdminMissionDraft } from "@/modules/admin/schemas";

export function ProductionMissionEditor({
  initial,
  taxonomy,
  missionId,
  status = "draft",
}: {
  initial: AdminMissionDraft;
  taxonomy: MissionEditorTaxonomy;
  missionId?: string;
  status?: string;
}) {
  const content = useContent("admin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const form = useForm<AdminMissionDraft>({
    resolver: zodResolver(adminMissionDraftSchema) as Resolver<AdminMissionDraft>,
    defaultValues: initial,
    mode: "onChange",
  });
  const title = useWatch({ control: form.control, name: "title" });
  const safety = useWatch({ control: form.control, name: "safety" });
  const allSafe = Object.values(safety).every(Boolean);

  const saveMutation = useMutation({
    mutationFn: (draft: AdminMissionDraft) => adminMissionsApi.saveDraft(missionId, draft),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      toast.success(contentText(content, "missionEditor.saved", "Đã lưu bản nháp"));
      if (!missionId) {
        router.push(`/admin/missions/${result.id}/edit`);
      }
      router.refresh();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (draft: AdminMissionDraft) => {
      const saved = await adminMissionsApi.saveDraft(missionId, draft);
      await adminMissionsApi.submit(saved.id);
      return saved.id;
    },
    onSuccess: async (savedId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      toast.success(contentText(content, "missionEditor.submitted", "Đã gửi nhiệm vụ đến người kiểm duyệt"));
      if (!missionId) router.push(`/admin/missions/${savedId}/edit`);
      router.refresh();
    },
  });

  const pending = saveMutation.isPending || submitMutation.isPending;
  const mutationError = saveMutation.error ?? submitMutation.error;

  function saveDraft() {
    void form.handleSubmit((draft) => saveMutation.mutate(draft))();
  }

  function submitReview() {
    void form.handleSubmit((draft) => submitMutation.mutate(draft))();
  }

  return (
    <FormProvider {...form}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <form
          className="min-w-0 space-y-5"
          onSubmit={form.handleSubmit((draft) => saveMutation.mutate(draft))}
          noValidate
        >
          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <Link
              href="/admin/missions"
              className="inline-flex items-center gap-2 text-sm font-black text-[#6f6558]"
            >
              <ArrowLeft size={17} /> Quay lại danh sách nhiệm vụ
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[#8a8176]">
                  {missionId
                    ? contentText(content, "missionEditor.modeEdit", "Đang chỉnh sửa nhiệm vụ")
                    : contentText(content, "missionEditor.modeCreate", "Tạo nhiệm vụ mới")}
                </p>
                <h1 className="text-3xl font-black">
                  {title || contentText(content, "missionEditor.newTitle", "Nhiệm vụ chưa đặt tên")}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <MissionStatusBadge status={status} />
                <Button
                  type="submit"
                  disabled={pending}
                  aria-busy={saveMutation.isPending}
                  className="min-h-10 rounded-xl px-4 py-2 text-sm shadow-[0_4px_0_#bd4910]"
                >
                  <Save size={16} className="mr-2 inline" />
                  {saveMutation.isPending
                    ? contentText(content, "missionEditor.saving", "Đang lưu...")
                    : contentText(content, "missionEditor.saveDraft", "Lưu để tiếp tục sau")}
                </Button>
              </div>
            </div>
          </div>

          <MissionBasicFields taxonomy={taxonomy} />
          <MissionQuestionsSection
            activeQuestion={activeQuestion}
            onActiveQuestionChange={setActiveQuestion}
          />
          <MissionSafetySection />

          <FormStatus status={mutationError ? "error" : "idle"} message={mutationError?.message} />
          {form.formState.isSubmitted && !form.formState.isValid ? (
            <FormStatus
              status="error"
              message="Một số trường chưa hợp lệ. Hãy kiểm tra thông báo bên dưới từng trường."
            />
          ) : null}

          <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white/95 p-3 shadow-xl backdrop-blur">
            <div>
              <p className="text-sm font-black">Hoàn tất nội dung theo thứ tự từ trên xuống.</p>
              <p className="text-xs text-[#6f6558]">
                {allSafe ? "Đã đủ điều kiện gửi kiểm duyệt." : "Cần xác nhận đủ 6 mục an toàn trước khi gửi."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveDraft} disabled={pending}>
                <Save size={18} className="mr-2 inline" />
                {saveMutation.isPending
                  ? contentText(content, "missionEditor.saving", "Đang lưu...")
                  : contentText(content, "missionEditor.saveDraft", "Lưu để tiếp tục sau")}
              </Button>
              <button
                type="button"
                onClick={submitReview}
                disabled={pending || !allSafe}
                aria-busy={submitMutation.isPending}
                className="min-h-12 rounded-2xl bg-[#5d8c48] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} className="mr-2 inline" />
                {submitMutation.isPending
                  ? contentText(content, "missionEditor.submitting", "Đang gửi...")
                  : contentText(content, "missionEditor.submit", "Gửi người kiểm duyệt")}
              </button>
            </div>
          </div>
        </form>

        <MissionEditorPreview activeQuestion={activeQuestion} />
      </div>
    </FormProvider>
  );
}
