"use client";

import { useMutation } from "@tanstack/react-query";
import { Archive, Copy, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminMissionsApi } from "@/api/admin/missions";

export function MissionListActions({
  missionId,
  showLabels = false,
}: {
  missionId: string;
  showLabels?: boolean;
}) {
  const router = useRouter();
  const duplicateMutation = useMutation({
    mutationFn: () => adminMissionsApi.duplicate(missionId),
    onSuccess: (result) => {
      toast.success("Đã tạo bản sao");
      router.push(`/admin/missions/${result.id}/edit`);
    },
  });
  const archiveMutation = useMutation({
    mutationFn: () => adminMissionsApi.archive(missionId),
    onSuccess: () => {
      toast.success("Đã lưu trữ nhiệm vụ");
      router.refresh();
    },
  });

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-label="Nhân bản nhiệm vụ"
        aria-busy={duplicateMutation.isPending}
        disabled={duplicateMutation.isPending || archiveMutation.isPending}
        onClick={() => duplicateMutation.mutate()}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 font-bold disabled:opacity-50"
      >
        {duplicateMutation.isPending ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Copy size={16} />
        )}
        {showLabels ? "Tạo bản sao" : null}
      </button>
      <button
        type="button"
        aria-label="Lưu trữ nhiệm vụ"
        aria-busy={archiveMutation.isPending}
        disabled={duplicateMutation.isPending || archiveMutation.isPending}
        onClick={() => {
          if (window.confirm("Lưu trữ nhiệm vụ này?")) archiveMutation.mutate();
        }}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-bold text-amber-800 disabled:opacity-50"
      >
        {archiveMutation.isPending ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Archive size={16} />
        )}
        {showLabels ? "Lưu trữ" : null}
      </button>
      {duplicateMutation.isError || archiveMutation.isError ? (
        <span role="alert" className="sr-only">
          {(duplicateMutation.error ?? archiveMutation.error)?.message}
        </span>
      ) : null}
    </div>
  );
}
