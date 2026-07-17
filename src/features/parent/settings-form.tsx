"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { childrenApi } from "@/api/children";
import { parentApi } from "@/api/parent";
import { AsyncButton } from "@/components/async-button";
import { CheckboxField, FormStatus, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { type ParentSettingsFormValues, parentSettingsSchema } from "@/features/parent/settings-schema";
import { SettingsSection } from "@/features/parent/settings-section";
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.parent.dashboard });
      toast.success(contentText(content, "settings.resetSuccess", "Đã xóa tiến độ"));
    },
  });
  const deleteMutation = useMutation({
    mutationFn: parentApi.requestDeletion,
    onSuccess: () => toast.success(contentText(content, "settings.deleteSuccess", "Đã ghi nhận yêu cầu xóa")),
  });
  const actionError = exportMutation.error ?? resetMutation.error ?? deleteMutation.error;

  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
      noValidate
    >
      <SettingsSection title={contentText(content, "settings.audioTitle", "Âm thanh và hiệu ứng")}>
        <CheckboxField
          label={contentText(content, "settings.soundEnabled", "Âm thanh hướng dẫn")}
          registration={form.register("soundEnabled")}
        />
        <CheckboxField
          label={contentText(content, "settings.effectsEnabled", "Hiệu ứng chúc mừng")}
          registration={form.register("effectsEnabled")}
        />
      </SettingsSection>

      <SettingsSection title={contentText(content, "settings.notificationsTitle", "Thông báo phụ huynh")}>
        <CheckboxField
          label={contentText(content, "settings.missionCompleted", "Khi bé hoàn thành nhiệm vụ")}
          registration={form.register("notificationSettings.missionCompleted")}
        />
        <CheckboxField
          label={contentText(content, "settings.suggestions", "Khi có gợi ý trò chuyện mới")}
          registration={form.register("notificationSettings.suggestions")}
        />
        <CheckboxField
          label={contentText(content, "settings.weeklySummary", "Tóm tắt tuần")}
          registration={form.register("notificationSettings.weeklySummary")}
        />
      </SettingsSection>

      <SettingsSection title={contentText(content, "settings.privacyTitle", "Quyền riêng tư")}>
        <CheckboxField
          label={contentText(content, "settings.analyticsTitle", "Phân tích sản phẩm tối giản")}
          description={contentText(
            content,
            "settings.analyticsDescription",
            "Không dùng quảng cáo hoặc định vị.",
          )}
          registration={form.register("privacySettings.analytics")}
        />
      </SettingsSection>

      <SettingsSection title={contentText(content, "settings.pinTitle", "PIN phụ huynh")}>
        <TextField
          type="password"
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
        pending={saveMutation.isPending}
        pendingLabel={contentText(content, "settings.saving", "Đang lưu...")}
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
            onClick={() => {
              if (window.confirm(contentText(content, "settings.resetConfirm", "Xóa toàn bộ tiến độ?"))) {
                resetMutation.mutate();
              }
            }}
            className="h-full bg-amber-600 shadow-none"
          >
            {contentText(content, "settings.resetProgress", "Đặt lại tiến độ bé")}
          </AsyncButton>
          <AsyncButton
            pending={deleteMutation.isPending}
            pendingLabel="Đang gửi..."
            onClick={() => {
              if (
                window.confirm(contentText(content, "settings.deleteConfirm", "Gửi yêu cầu xóa dữ liệu?"))
              ) {
                deleteMutation.mutate();
              }
            }}
            className="h-full bg-red-700 shadow-none"
          >
            {contentText(content, "settings.deleteRequest", "Yêu cầu xóa dữ liệu")}
          </AsyncButton>
        </div>
        <FormStatus status={actionError ? "error" : "idle"} message={actionError?.message} className="mt-4" />
      </Card>
    </form>
  );
}
