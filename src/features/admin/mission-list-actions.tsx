"use client";

import { useRouter } from "next/navigation";
import { Archive, Copy } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

export function MissionListActions({ missionId }: { missionId: string }) {
  const router = useRouter();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-label="Nhân bản nhiệm vụ"
        onClick={async () => {
          try {
            const result = await requestJson<{ id: string }>(`/api/admin/missions/${missionId}/duplicate`, {
              method: "POST",
            });
            toast.success("Đã tạo bản sao");
            router.push(`/admin/missions/${result.id}/edit`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể nhân bản");
          }
        }}
        className="rounded-lg border p-2"
      >
        <Copy size={16} />
      </button>
      <button
        type="button"
        aria-label="Lưu trữ nhiệm vụ"
        onClick={async () => {
          if (!window.confirm("Lưu trữ nhiệm vụ này?")) return;
          try {
            await requestJson(`/api/admin/missions/${missionId}/archive`, { method: "POST" });
            toast.success("Đã lưu trữ nhiệm vụ");
            router.refresh();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Không thể lưu trữ");
          }
        }}
        className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-800"
      >
        <Archive size={16} />
      </button>
    </div>
  );
}
