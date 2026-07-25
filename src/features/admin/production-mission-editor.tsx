"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { adminMissionsApi, type AdminMissionVersionSummary } from "@/api/admin/missions";
import { FormStatus } from "@/components/form";
import { Button } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { MissionBasicFields } from "@/features/admin/mission-editor/basic-fields";
import { MissionEditorPreview } from "@/features/admin/mission-editor/preview";
import { MissionQuestionsSection } from "@/features/admin/mission-editor/questions-section";
import { MissionSafetySection } from "@/features/admin/mission-editor/safety-section";
import { MissionAutosaveStatus, type MissionAutosaveState } from "@/features/admin/mission-autosave-status";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import { MissionVersionHistory } from "@/features/admin/mission-version-history";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { ApiRequestError } from "@/lib/api/error";
import { queryKeys } from "@/lib/query/keys";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { adminMissionDraftSchema, type AdminMissionDraft } from "@/modules/admin/schemas";

const AUTOSAVE_DELAY_MS = 1_500;

type DraftSaveVariables = {
  draft: AdminMissionDraft;
  serialized: string;
  expectedDraftVersion?: number;
};

function serializeDraft(draft: AdminMissionDraft) {
  return JSON.stringify(draft);
}

export function ProductionMissionEditor({
  initial,
  taxonomy,
  missionId,
  status = "draft",
  updatedAt,
  draftVersion = 1,
  versions = [],
  templateVariables,
}: {
  initial: AdminMissionDraft;
  taxonomy: MissionEditorTaxonomy;
  templateVariables: ContentVariableDefinition[];
  missionId?: string;
  status?: string;
  updatedAt?: string;
  draftVersion?: number;
  versions?: AdminMissionVersionSummary[];
}) {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [validationError, setValidationError] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [autosaveState, setAutosaveState] = useState<MissionAutosaveState>(missionId ? "saved" : "idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => (updatedAt ? new Date(updatedAt) : null));
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSavedSerialized, setLastSavedSerialized] = useState(() => serializeDraft(initial));
  const [lastAttemptedSerialized, setLastAttemptedSerialized] = useState<string | null>(null);
  const [currentDraftVersion, setCurrentDraftVersion] = useState(draftVersion);
  const form = useForm<AdminMissionDraft>({
    resolver: zodResolver(adminMissionDraftSchema) as Resolver<AdminMissionDraft>,
    defaultValues: initial,
    mode: "onChange",
  });
  const title = useWatch({ control: form.control, name: "title" });
  const safety = useWatch({ control: form.control, name: "safety" });
  const watchedDraft = useWatch({ control: form.control }) as AdminMissionDraft;
  const serializedDraft = useMemo(() => serializeDraft(watchedDraft), [watchedDraft]);
  const allSafe = Object.values(safety).every(Boolean);
  const hasUnsavedChanges = serializedDraft !== lastSavedSerialized;

  const clearAutosaveTimer = useCallback(() => {
    if (!autosaveTimerRef.current) return;
    clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
  }, []);

  function recordSavedDraft(
    result: { status: string; currentDraftVersion: number; updatedAt: string },
    variables: DraftSaveVariables,
  ) {
    setLastSavedSerialized(variables.serialized);
    setLastAttemptedSerialized(null);
    setCurrentDraftVersion(result.currentDraftVersion);
    setLastSavedAt(new Date(result.updatedAt));
    setCurrentStatus(result.status);

    const currentSerialized = serializeDraft(form.getValues());
    if (currentSerialized === variables.serialized) {
      form.reset(form.getValues());
      setAutosaveState("saved");
    } else {
      setAutosaveState("unsaved");
    }
  }

  function recordSaveError(error: unknown, variables: DraftSaveVariables) {
    setLastAttemptedSerialized(variables.serialized);
    setAutosaveState(error instanceof ApiRequestError && error.status === 409 ? "conflict" : "error");
  }

  const autosaveMutation = useMutation({
    mutationFn: (variables: DraftSaveVariables) =>
      adminMissionsApi.autosaveDraft(missionId!, variables.draft, variables.expectedDraftVersion),
    onSuccess: async (result, variables) => {
      recordSavedDraft(result, variables);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.missions,
        refetchType: "none",
      });
    },
    onError: recordSaveError,
  });

  const saveMutation = useMutation({
    mutationFn: (variables: DraftSaveVariables) =>
      adminMissionsApi.saveDraft(missionId, variables.draft, variables.expectedDraftVersion),
    onSuccess: async (result, variables) => {
      setValidationError(false);
      recordSavedDraft(result, variables);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      toast.success(contentText(content, "missionEditor.saved", "Đã lưu bản nháp"), {
        id: "mission-save-success",
      });
      if (!missionId) {
        navigation.push(`/admin/missions/${result.id}/edit`);
      }
    },
    onError: recordSaveError,
  });

  const submitMutation = useMutation({
    mutationFn: async (variables: DraftSaveVariables) => {
      const saved = await adminMissionsApi.saveDraft(
        missionId,
        variables.draft,
        variables.expectedDraftVersion,
      );
      await adminMissionsApi.submit(saved.id);
      return saved;
    },
    onSuccess: async (saved, variables) => {
      setValidationError(false);
      recordSavedDraft(saved, variables);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      toast.success(contentText(content, "missionEditor.submitted", "Đã gửi nhiệm vụ để kiểm tra"), {
        id: "mission-submit-success",
      });
      if (!missionId) {
        navigation.push(`/admin/missions/${saved.id}/edit`);
      } else {
        navigation.refresh();
      }
    },
    onError: recordSaveError,
  });

  const { isPending: isAutosaving, mutate: runAutosave } = autosaveMutation;

  useEffect(() => {
    if (!missionId) return;
    clearAutosaveTimer();
    if (!hasUnsavedChanges || isAutosaving || lastAttemptedSerialized === serializedDraft) return;

    autosaveTimerRef.current = setTimeout(() => {
      const draft = form.getValues();
      const parsed = adminMissionDraftSchema.safeParse(draft);
      setLastAttemptedSerialized(serializedDraft);
      if (!parsed.success) {
        setAutosaveState("invalid");
        return;
      }

      runAutosave({
        draft: parsed.data,
        serialized: serializedDraft,
        expectedDraftVersion: currentDraftVersion,
      });
    }, AUTOSAVE_DELAY_MS);

    return clearAutosaveTimer;
  }, [
    clearAutosaveTimer,
    currentDraftVersion,
    form,
    hasUnsavedChanges,
    isAutosaving,
    lastAttemptedSerialized,
    missionId,
    runAutosave,
    serializedDraft,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (serializeDraft(form.getValues()) === lastSavedSerialized) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, lastSavedSerialized]);

  const displayedAutosaveState: MissionAutosaveState = !missionId
    ? "idle"
    : isAutosaving
      ? "saving"
      : !hasUnsavedChanges
        ? "saved"
        : lastAttemptedSerialized === serializedDraft &&
            (autosaveState === "invalid" || autosaveState === "error" || autosaveState === "conflict")
          ? autosaveState
          : "unsaved";

  const pending = saveMutation.isPending || submitMutation.isPending || isAutosaving || navigation.isPending;
  const mutationError = saveMutation.error ?? submitMutation.error;
  const mutationErrorMessage = mutationError instanceof Error ? mutationError.message : undefined;

  function buildSaveVariables(draft: AdminMissionDraft): DraftSaveVariables {
    return {
      draft,
      serialized: serializeDraft(form.getValues()),
      expectedDraftVersion: currentDraftVersion,
    };
  }

  function handleInvalid() {
    toast.dismiss("mission-save-success");
    toast.dismiss("mission-submit-success");
    setValidationError(true);
    if (missionId) {
      setLastAttemptedSerialized(serializeDraft(form.getValues()));
      setAutosaveState("invalid");
    }
  }

  function runManualSave(draft: AdminMissionDraft) {
    clearAutosaveTimer();
    setValidationError(false);
    saveMutation.mutate(buildSaveVariables(draft));
  }

  function saveDraft() {
    void form.handleSubmit(runManualSave, handleInvalid)();
  }

  function submitReview() {
    clearAutosaveTimer();
    void form.handleSubmit((draft) => {
      setValidationError(false);
      submitMutation.mutate(buildSaveVariables(draft));
    }, handleInvalid)();
  }

  return (
    <FormProvider {...form}>
      <div className="grid gap-6 xl:h-full xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_370px]">
        <form
          data-testid="mission-editor-fields-scroll-region"
          aria-label={contentText(content, "missionEditor.editRegion", "Thông tin nhiệm vụ")}
          tabIndex={0}
          className="min-w-0 space-y-5 outline-none focus-visible:ring-2 focus-visible:ring-[#d86a24] focus-visible:ring-inset xl:min-h-0 xl:scrollbar-thin xl:overflow-y-auto xl:overscroll-contain xl:pr-2 xl:pb-2"
          onSubmit={(event) => {
            void form.handleSubmit(runManualSave, handleInvalid)(event);
          }}
          noValidate
        >
          <div className="rounded-2xl border bg-white p-4 sm:p-5">
            <Link
              href="/admin/missions"
              onClick={(event) => {
                if (!hasUnsavedChanges) return;
                const message = contentText(
                  content,
                  "missionEditor.autosave.leaveWarning",
                  "Một số thay đổi chưa được lưu. Bạn có chắc muốn rời khỏi trang?",
                );
                if (!window.confirm(message)) event.preventDefault();
              }}
              className="type-action inline-flex items-center gap-2 font-black text-[#6f6558]"
            >
              <ArrowLeft size={17} /> Quay lại danh sách nhiệm vụ
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="type-caption font-bold text-[#756b60]">
                  {missionId
                    ? contentText(content, "missionEditor.modeEdit", "Đang chỉnh sửa nhiệm vụ")
                    : contentText(content, "missionEditor.modeCreate", "Tạo nhiệm vụ mới")}
                </p>
                <h1 className="type-page-title">
                  {title || contentText(content, "missionEditor.newTitle", "Nhiệm vụ chưa đặt tên")}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {missionId ? (
                  <MissionAutosaveStatus state={displayedAutosaveState} lastSavedAt={lastSavedAt} />
                ) : null}
                <MissionStatusBadge status={currentStatus} />
                <Button
                  type="submit"
                  disabled={pending}
                  aria-busy={saveMutation.isPending || navigation.isPending}
                  className="min-h-10 rounded-xl px-4 py-2 shadow-[0_4px_0_#bd4910]"
                >
                  <Save size={16} className="mr-2 inline" />
                  {saveMutation.isPending || navigation.isPending
                    ? contentText(content, "missionEditor.saving", "Đang lưu...")
                    : contentText(content, "missionEditor.saveDraft", "Lưu và làm tiếp sau")}
                </Button>
              </div>
            </div>
          </div>

          <MissionBasicFields taxonomy={taxonomy} templateVariables={templateVariables} />
          <MissionQuestionsSection
            activeQuestion={activeQuestion}
            onActiveQuestionChange={setActiveQuestion}
            templateVariables={templateVariables}
          />
          <MissionSafetySection />
          {missionId ? <MissionVersionHistory missionId={missionId} versions={versions} /> : null}

          <FormStatus status={mutationError ? "error" : "idle"} message={mutationErrorMessage} />
          {validationError ? (
            <FormStatus
              status="error"
              message="Một số mục còn thiếu hoặc chưa đúng nên bản nháp chưa được lưu. Hãy xem lời nhắc bên dưới từng mục."
            />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">
            <div>
              <p className="type-label font-black">Điền lần lượt các phần từ trên xuống.</p>
              <p className="type-caption text-[#6f6558]">
                {allSafe
                  ? "Đã đủ điều kiện để gửi kiểm tra."
                  : "Hãy xác nhận đủ 6 mục an toàn trước khi gửi."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveDraft} disabled={pending}>
                <Save size={18} className="mr-2 inline" />
                {saveMutation.isPending || navigation.isPending
                  ? contentText(content, "missionEditor.saving", "Đang lưu...")
                  : contentText(content, "missionEditor.saveDraft", "Lưu và làm tiếp sau")}
              </Button>
              <button
                type="button"
                onClick={submitReview}
                disabled={pending || !allSafe}
                aria-busy={submitMutation.isPending || navigation.isPending}
                className="min-h-12 rounded-2xl bg-[#517d3f] px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} className="mr-2 inline" />
                {submitMutation.isPending || navigation.isPending
                  ? contentText(content, "missionEditor.submitting", "Đang gửi...")
                  : contentText(content, "missionEditor.submit", "Gửi để kiểm tra")}
              </button>
            </div>
          </div>
        </form>

        <MissionEditorPreview activeQuestion={activeQuestion} templateVariables={templateVariables} />
      </div>
    </FormProvider>
  );
}
