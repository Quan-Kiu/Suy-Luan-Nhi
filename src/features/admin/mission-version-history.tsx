"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { History, LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { adminMissionsApi, type AdminMissionVersionSummary } from "@/api/admin/missions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Card } from "@/components/ui";
import { contentTemplate, contentText, useContent } from "@/content/client";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

export function MissionVersionHistory({
  missionId,
  versions,
}: {
  missionId: string;
  versions: AdminMissionVersionSummary[];
}) {
  const content = useContent("admin");
  const form = useFormContext<AdminMissionDraft>();
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<AdminMissionVersionSummary | null>(null);
  const mutation = useMutation({
    mutationFn: (versionId: string) => adminMissionsApi.restoreVersion(missionId, versionId),
    onSuccess: async (result) => {
      form.reset(result.draft);
      setSelectedVersion(null);
      toast.success(
        contentTemplate(content, "missionVersions.restoreSuccess", "Đã tạo bản nháp từ lần gửi {number}", {
          number: result.versionNumber,
        }),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions });
      navigation.refresh();
    },
  });
  const pending = mutation.isPending || navigation.isPending;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
          <History size={21} />
        </span>
        <div>
          <h2 className="type-section-title">
            {contentText(content, "missionVersions.title", "Các lần đã gửi")}
          </h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            {contentText(
              content,
              "missionVersions.description",
              "Mỗi lần gửi đều được giữ lại. Bạn có thể dùng lại nội dung cũ để tạo một bản nháp mới.",
            )}
          </p>
        </div>
      </div>

      {versions.length ? (
        <div className="mt-4 space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#eadfc9] bg-[#fffdf8] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>
                    {contentTemplate(content, "missionVersions.version", "Lần gửi {number}", {
                      number: version.versionNumber,
                    })}
                  </strong>
                  <MissionStatusBadge status={version.status} />
                </div>
                <p className="type-caption mt-1 text-[#806d54]">
                  {contentTemplate(content, "missionVersions.createdAt", "Đã gửi {time}", {
                    time: new Date(version.createdAt).toLocaleString("vi-VN"),
                  })}
                </p>
                {version.reviewComment ? (
                  <p className="type-supporting mt-2 line-clamp-2 text-[#5f5548]">
                    <strong>{contentText(content, "missionVersions.reviewComment", "Nhận xét:")}</strong>{" "}
                    {version.reviewComment}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setSelectedVersion(version)}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-3 font-black text-[#6b4a2c] disabled:opacity-50"
              >
                {pending && mutation.variables === version.id ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <RotateCcw size={16} />
                )}
                {contentText(content, "missionVersions.restore", "Dùng lại nội dung này")}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="type-supporting mt-4 rounded-2xl bg-[#f5f2ec] p-4 text-[#6f6558]">
          {contentText(
            content,
            "missionVersions.empty",
            "Chưa có lần gửi nào. Danh sách này sẽ xuất hiện sau khi bạn gửi nhiệm vụ lần đầu.",
          )}
        </p>
      )}

      <ConfirmDialog
        open={Boolean(selectedVersion)}
        title={contentTemplate(
          content,
          "missionVersions.restoreTitle",
          "Dùng lại nội dung của lần gửi {number}?",
          {
            number: selectedVersion?.versionNumber ?? "",
          },
        )}
        description={`${
          form.formState.isDirty
            ? `${contentText(content, "missionVersions.unsavedWarning", "Các thay đổi chưa lưu sẽ mất. ")}`
            : ""
        }${contentText(
          content,
          "missionVersions.restoreDescription",
          "Nội dung cũ vẫn được giữ nguyên. Hệ thống sẽ chép nội dung này thành bản nháp để bạn kiểm tra và gửi lại.",
        )}`}
        confirmLabel={contentText(content, "missionVersions.restoreConfirm", "Dùng lại nội dung này")}
        pendingLabel={contentText(content, "missionVersions.restoring", "Đang tạo bản nháp...")}
        pending={pending}
        tone="warning"
        onClose={() => setSelectedVersion(null)}
        onConfirm={() => {
          if (selectedVersion) mutation.mutate(selectedVersion.id);
        }}
      />
    </Card>
  );
}
