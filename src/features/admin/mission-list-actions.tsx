"use client";

import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Copy, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminMissionsApi,
  type AdminMissionListFilters,
  type AdminMissionListItem,
  type AdminMissionPage,
} from "@/api/admin/missions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

function removeMissionFromCachedLists(queryClient: QueryClient, missionId: string, archivedLists: boolean) {
  const cachedLists = queryClient.getQueriesData<AdminMissionPage>({
    queryKey: queryKeys.admin.missions,
  });

  for (const [queryKey, page] of cachedLists) {
    if (!page) continue;
    const filters = queryKey[2] as AdminMissionListFilters | undefined;
    const isArchivedList = filters?.status === "archived";
    if (isArchivedList !== archivedLists || !page.items.some((item) => item.id === missionId)) continue;

    const total = Math.max(0, page.total - 1);
    queryClient.setQueryData<AdminMissionPage>(queryKey, {
      ...page,
      items: page.items.filter((item) => item.id !== missionId),
      total,
      totalPages: Math.max(1, Math.ceil(total / page.pageSize)),
    });
  }
}

export function MissionListActions({
  missionId,
  status,
  showLabels = false,
}: {
  missionId: string;
  status: AdminMissionListItem["status"];
  showLabels?: boolean;
}) {
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const archived = status === "archived";

  const refreshMissionQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions }),
      queryClient.invalidateQueries({ queryKey: queryKeys.children.all }),
    ]);
  };

  const duplicateMutation = useMutation({
    mutationFn: () => adminMissionsApi.duplicate(missionId),
    onSuccess: (result) => {
      toast.success("Đã tạo bản sao");
      navigation.push(`/admin/missions/${result.id}/edit`);
    },
    onError: (error) => toast.error(error.message),
  });

  const restoreMutation = useMutation({
    mutationFn: () => adminMissionsApi.restore(missionId),
    onSuccess: async () => {
      removeMissionFromCachedLists(queryClient, missionId, true);
      toast.success("Đã khôi phục nhiệm vụ về Bản nháp");
      await refreshMissionQueries();
    },
    onError: (error) => toast.error(error.message),
  });

  const archiveMutation = useMutation({
    mutationFn: () => adminMissionsApi.archive(missionId),
    onSuccess: async () => {
      setArchiveOpen(false);
      removeMissionFromCachedLists(queryClient, missionId, false);
      toast.success("Đã chuyển nhiệm vụ vào Kho lưu trữ", {
        action: {
          label: "Hoàn tác",
          onClick: () => {
            void adminMissionsApi
              .restore(missionId)
              .then(async () => {
                toast.success("Đã hoàn tác lưu trữ");
                await refreshMissionQueries();
              })
              .catch((error: unknown) => {
                toast.error(error instanceof Error ? error.message : "Không thể hoàn tác lưu trữ");
              });
          },
        },
      });
      await refreshMissionQueries();
    },
    onError: (error) => toast.error(error.message),
  });

  const pending =
    duplicateMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending ||
    navigation.isPending;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="Nhân bản nhiệm vụ"
          aria-busy={duplicateMutation.isPending || navigation.isPending}
          disabled={pending}
          onClick={() => duplicateMutation.mutate()}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg border bg-white px-3 py-2 font-bold disabled:opacity-50"
        >
          {duplicateMutation.isPending || navigation.isPending ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Copy size={16} />
          )}
          {showLabels ? "Tạo bản sao" : null}
        </button>

        {archived ? (
          <button
            type="button"
            aria-label="Khôi phục nhiệm vụ"
            aria-busy={restoreMutation.isPending}
            disabled={pending}
            onClick={() => restoreMutation.mutate()}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-bold text-emerald-800 disabled:opacity-50"
          >
            {restoreMutation.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <ArchiveRestore size={16} />
            )}
            {showLabels ? "Khôi phục" : null}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Lưu trữ nhiệm vụ"
            aria-busy={archiveMutation.isPending}
            disabled={pending}
            onClick={() => setArchiveOpen(true)}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-bold text-amber-800 disabled:opacity-50"
          >
            {archiveMutation.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Archive size={16} />
            )}
            {showLabels ? "Lưu trữ" : null}
          </button>
        )}

        {duplicateMutation.isError || archiveMutation.isError || restoreMutation.isError ? (
          <span role="alert" className="sr-only">
            {(duplicateMutation.error ?? archiveMutation.error ?? restoreMutation.error)?.message}
          </span>
        ) : null}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        title="Chuyển nhiệm vụ vào Kho lưu trữ?"
        description="Nhiệm vụ sẽ ngừng hiển thị cho bé và được chuyển sang Kho lưu trữ. Khi cần, bạn có thể khôi phục nhiệm vụ về Bản nháp."
        confirmLabel="Lưu trữ nhiệm vụ"
        pendingLabel="Đang lưu trữ..."
        tone="warning"
        pending={archiveMutation.isPending}
        onClose={() => setArchiveOpen(false)}
        onConfirm={() => archiveMutation.mutate()}
      />
    </>
  );
}
