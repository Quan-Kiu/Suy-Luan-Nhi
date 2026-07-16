"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Rocket, XCircle } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

export function ReviewActions({
  missionId,
  versionId,
  status,
}: {
  missionId: string;
  versionId: string;
  status: string;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [scheduledFor, setScheduledFor] = useState("");

  async function decide(action: "approve" | "reject") {
    if (comment.trim().length < 4) {
      toast.error("Reviewer cần ghi nhận xét ít nhất 4 ký tự");
      return;
    }
    setPending(action);
    try {
      await requestJson(`/api/admin/missions/${missionId}/versions/${versionId}/${action}`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      });
      toast.success(action === "approve" ? "Đã duyệt phiên bản" : "Đã trả lại để chỉnh sửa");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể ghi quyết định");
    } finally {
      setPending(null);
    }
  }

  async function publish() {
    setPending("publish");
    try {
      await requestJson(`/api/admin/missions/${missionId}/versions/${versionId}/publish`, { method: "POST" });
      toast.success("Phiên bản đã được xuất bản cho Child App");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xuất bản");
    } finally {
      setPending(null);
    }
  }

  if (status === "approved") {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={publish}
          disabled={Boolean(pending)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#5d8c48] px-5 font-black text-white"
        >
          <Rocket size={18} /> {pending === "publish" ? "Đang xuất bản..." : "Xuất bản ngay"}
        </button>
        <div className="rounded-xl border bg-[#f7f3eb] p-3">
          <label className="block text-sm font-black">
            Hoặc lên lịch xuất bản
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(event) => setScheduledFor(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border bg-white px-3 font-normal"
            />
          </label>
          <button
            type="button"
            disabled={!scheduledFor || Boolean(pending)}
            onClick={async () => {
              setPending("schedule");
              try {
                await requestJson(`/api/admin/missions/${missionId}/versions/${versionId}/schedule`, {
                  method: "POST",
                  body: JSON.stringify({ scheduledFor: new Date(scheduledFor).toISOString() }),
                });
                toast.success("Đã lên lịch xuất bản");
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Không thể lên lịch");
              } finally {
                setPending(null);
              }
            }}
            className="mt-3 min-h-10 w-full rounded-xl border border-[#5d8c48] bg-white font-black text-[#4d743b] disabled:opacity-40"
          >
            {pending === "schedule" ? "Đang lên lịch..." : "Lưu lịch xuất bản"}
          </button>
        </div>
      </div>
    );
  }
  if (status !== "in_review") return null;

  return (
    <div className="space-y-3">
      <label className="block font-black">
        Nhận xét reviewer
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          placeholder="Nêu rõ lý do duyệt hoặc nội dung cần chỉnh sửa..."
          className="mt-2 w-full rounded-xl border p-3 font-normal"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => decide("approve")}
          disabled={Boolean(pending)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#5d8c48] px-4 font-black text-white"
        >
          <CheckCircle2 size={18} /> {pending === "approve" ? "Đang duyệt..." : "Duyệt phiên bản"}
        </button>
        <button
          type="button"
          onClick={() => decide("reject")}
          disabled={Boolean(pending)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-700 px-4 font-black text-white"
        >
          <XCircle size={18} /> {pending === "reject" ? "Đang trả lại..." : "Yêu cầu chỉnh sửa"}
        </button>
      </div>
    </div>
  );
}
