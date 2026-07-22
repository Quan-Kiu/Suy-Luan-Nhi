"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { childrenApi } from "@/api/children";
import { parentApi } from "@/api/parent";
import { AsyncButton } from "@/components/async-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ControlledCheckboxField, FormStatus, PasswordField, SubmitButton } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { type ParentSettingsFormValues, parentSettingsSchema } from "@/features/parent/settings-schema";
import { SettingsSection } from "@/features/parent/settings-section";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

type Settings = {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  notificationSettings: Record<string, boolean>;
  privacySettings: Record<string, boolean>;
};

function normalizeSettings(initial: Settings): ParentSettingsFormValues {
  return {
    soundEnabled: initial.soundEnabled,
    effectsEnabled: initial.effectsEnabled,
    notificationSettings: {
      missionCompleted: initial.notificationSettings.missionCompleted ?? false,
      suggestions: initial.notificationSettings.suggestions ?? false,
      weeklySummary: initial.notificationSettings.weeklySummary ?? false,
    },
    privacySettings: { analytics: initial.privacySettings.analytics ?? true },
    pin: "",
  };
}

export function SettingsForm({ initial, childId }: { initial: Settings; childId: string }) {
  const content = useContent("parent");
  const queryClient = useQueryClient();
  const navigation = usePendingRouter();
  const interactive = useHydrated();
  const [confirmAction, setConfirmAction] = useState<"reset" | "delete" | null>(null);
  const form = useForm<ParentSettingsFormValues>({
    resolver: zodResolver(parentSettingsSchema),
    defaultValues: normalizeSettings(initial),
  });
  const saveMutation = useMutation({
    mutationFn: ({ pin, ...values }: ParentSettingsFormValues) =>
      parentApi.updateSettings({ ...values, pin: pin || undefined }),
    onSuccess: async () => {
      form.setValue("pin", "");
      await queryClient.invalidateQueries({ queryKey: queryKeys.parent.settings });
      navigation.refresh();
      toast.success(contentText(content, "settings.saved", "Đã lưu cài đặt"));
    },
  });
  const exportMutation = useMutation({
    mutationFn: parentApi.requestExport,
    onSuccess: ({ downloadUrl }) => {
      toast.success(contentText(content, "settings.exportReady", "Gói dữ liệu đã sẵn sàng"));
      window.location.assign(downloadUrl);
    },
  });
  const resetMutation = useMutation({
    mutationFn: () => childrenApi.resetProgress(childId),
    onSuccess: async () => {
      setConfirmAction(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.parent.dashboard });
      toast.success(contentText(content, "settings.resetSuccess", "Đã xóa tiến độ"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: parentApi.requestDeletion,
    onSuccess: () => {
      setConfirmAction(null);
      toast.success(contentText(content, "settings.deleteSuccess", "Đã ghi nhận yêu cầu xóa"));
    },
  });
  const actionError = exportMutation.error ?? resetMutation.error ?? deleteMutation.error;

  return (
    <form
      onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      aria-busy={!interactive || saveMutation.isPending || navigation.isPending}
      noValidate
    >
      <fieldset
        disabled={!interactive || saveMutation.isPending || navigation.isPending}
        className="grid gap-5"
      >
        <SettingsSection title={contentText(content, "settings.audioTitle", "Âm thanh")}>
          <ControlledCheckboxField
            control={form.control}
            name="soundEnabled"
            label={contentText(content, "settings.soundEnabled", "Âm thanh tương tác")}
          />
          <ControlledCheckboxField
            control={form.control}
            name="effectsEnabled"
            label={contentText(content, "settings.effectsEnabled", "Âm thanh chúc mừng")}
          />
        </SettingsSection>

        <SettingsSection title={contentText(content, "settings.notificationsTitle", "Thông báo phụ huynh")}>
          <ControlledCheckboxField
            control={form.control}
            name="notificationSettings.missionCompleted"
            label={contentText(content, "settings.missionCompleted", "Khi bé hoàn thành nhiệm vụ")}
          />
          <ControlledCheckboxField
            control={form.control}
            name="notificationSettings.suggestions"
            label={contentText(content, "settings.suggestions", "Khi có gợi ý trò chuyện mới")}
          />
          <ControlledCheckboxField
            control={form.control}
            name="notificationSettings.weeklySummary"
            label={contentText(content, "settings.weeklySummary", "Tóm tắt tuần")}
          />
        </SettingsSection>

        <SettingsSection title={contentText(content, "settings.privacyTitle", "Quyền riêng tư")}>
          <ControlledCheckboxField
            control={form.control}
            name="privacySettings.analytics"
            label={contentText(content, "settings.analyticsTitle", "Dữ liệu giúp cải thiện ứng dụng")}
            description={contentText(
              content,
              "settings.analyticsDescription",
              "Không dùng quảng cáo hoặc định vị.",
            )}
          />
        </SettingsSection>

        <SettingsSection title={contentText(content, "settings.pinTitle", "PIN phụ huynh")}>
          <PasswordField
            autoComplete="new-password"
            inputMode="numeric"
            maxLength={8}
            label={contentText(content, "settings.pinTitle", "PIN phụ huynh")}
            description={contentText(content, "settings.pinDescription", "Đặt 4–8 chữ số.")}
            placeholder={contentText(content, "settings.pinPlaceholder", "PIN mới")}
            registration={form.register("pin", {
              onChange: (event) => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 8);
              },
            })}
            error={form.formState.errors.pin?.message}
          />
        </SettingsSection>

        <FormStatus status={saveMutation.isError ? "error" : "idle"} message={saveMutation.error?.message} />
        <SubmitButton
          pending={saveMutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "settings.saving", "Đang lưu...")}
          className="w-full justify-self-start sm:w-auto"
        >
          {contentText(content, "settings.save", "Lưu cài đặt")}
        </SubmitButton>

        <Card className="p-5">
          <h2 className="text-xl font-black">
            {contentText(content, "settings.dataTitle", "Dữ liệu gia đình")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <AsyncButton
              pending={exportMutation.isPending}
              pendingLabel="Đang chuẩn bị..."
              onClick={() => exportMutation.mutate()}
              className="h-full shadow-none"
            >
              {contentText(content, "settings.export", "Yêu cầu xuất dữ liệu")}
            </AsyncButton>
            <AsyncButton
              pending={resetMutation.isPending}
              pendingLabel="Đang đặt lại..."
              onClick={() => setConfirmAction("reset")}
              className="h-full bg-amber-700 shadow-none"
            >
              {contentText(content, "settings.resetProgress", "Đặt lại tiến độ bé")}
            </AsyncButton>
            <AsyncButton
              pending={deleteMutation.isPending}
              pendingLabel="Đang gửi..."
              onClick={() => setConfirmAction("delete")}
              className="h-full bg-red-700 shadow-none"
            >
              {contentText(content, "settings.deleteRequest", "Yêu cầu xóa dữ liệu")}
            </AsyncButton>
          </div>
          <FormStatus
            status={actionError ? "error" : "idle"}
            message={actionError?.message}
            className="mt-4"
          />
        </Card>
        <ConfirmDialog
          open={confirmAction === "reset"}
          title="Đặt lại toàn bộ tiến độ của bé?"
          description={contentText(
            content,
            "settings.resetConfirm",
            "Các lượt chơi, huy hiệu và thống kê hiện tại sẽ bị xóa. Hồ sơ của bé vẫn được giữ lại.",
          )}
          confirmLabel="Đặt lại tiến độ"
          pendingLabel="Đang đặt lại..."
          tone="warning"
          pending={resetMutation.isPending}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => resetMutation.mutate()}
        />
        <ConfirmDialog
          open={confirmAction === "delete"}
          title="Gửi yêu cầu xóa dữ liệu gia đình?"
          description={contentText(
            content,
            "settings.deleteConfirm",
            "Yêu cầu sẽ được chuyển đến quản trị viên. Ba/mẹ nên tải bản sao dữ liệu trước khi tiếp tục.",
          )}
          confirmLabel="Gửi yêu cầu xóa"
          pendingLabel="Đang gửi..."
          tone="danger"
          pending={deleteMutation.isPending}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => deleteMutation.mutate()}
        />
      </fieldset>
    </form>
  );
}
