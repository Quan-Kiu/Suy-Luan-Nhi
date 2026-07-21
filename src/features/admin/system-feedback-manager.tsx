"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, ExternalLink, ImageIcon, MessageSquareText, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { adminFeedbackApi, type SystemFeedbackItem, type SystemFeedbackPage } from "@/api/admin/feedback";
import { FormStatus } from "@/components/form";
import {
  systemFeedbackStatuses,
  systemFeedbackStatusLabels,
  type SystemFeedbackStatus,
} from "@/domain/system-feedback";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

const statusStyles: Record<SystemFeedbackStatus, string> = {
  new: "bg-blue-50 text-blue-800 border-blue-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  resolved: "bg-green-50 text-green-800 border-green-200",
  dismissed: "bg-slate-100 text-slate-700 border-slate-200",
};

function FeedbackCard({ item }: { item: SystemFeedbackItem }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SystemFeedbackStatus>(item.status);
  const [adminNote, setAdminNote] = useState(item.adminNote ?? "");
  const mutation = useMutation({
    mutationFn: () => adminFeedbackApi.update(item.id, { status, adminNote }),
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái góp ý");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.feedback });
    },
  });
  const viewport =
    typeof item.context.viewportWidth === "number" && typeof item.context.viewportHeight === "number"
      ? `${item.context.viewportWidth} × ${item.context.viewportHeight}px`
      : "Không có thông tin";

  return (
    <article className="rounded-3xl border border-[#e6dac7] bg-white p-5 shadow-[0_10px_28px_rgba(76,55,31,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn("rounded-full border px-3 py-1 text-xs font-black", statusStyles[item.status])}
            >
              {systemFeedbackStatusLabels[item.status]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#786d60]">
              <Clock3 size={14} /> {new Date(item.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          <h2 className="mt-3 flex items-center gap-2 text-lg font-black text-[#342f28]">
            <MessageSquareText size={19} className="text-[#b9470d]" />
            {item.pageTitle || "Góp ý từ một trang trong hệ thống"}
          </h2>
          <a
            href={item.pagePath}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-bold break-all text-[#9f3d0b] hover:underline"
          >
            {item.pagePath} <ExternalLink size={14} className="shrink-0" />
          </a>
        </div>
        <div className="rounded-2xl bg-[#f7f3eb] px-4 py-3 text-xs leading-5 text-[#62584d]">
          <p className="flex items-center gap-2 font-black">
            <UserRound size={15} /> {item.userName}
          </p>
          <p className="mt-1">{item.userEmail}</p>
          <p className="mt-1">Màn hình: {viewport}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#fff8ec] p-4 leading-7 whitespace-pre-wrap text-[#493f35]">
        {item.content}
      </div>

      {item.attachments.length ? (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-black text-[#4f463b]">
            <ImageIcon size={17} /> {item.attachments.length} ảnh đính kèm
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {item.attachments.map((attachment, index) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border bg-[#f3eee5]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachment.url}
                  alt={attachment.altText || `Ảnh góp ý ${index + 1}`}
                  className="aspect-video w-full object-cover transition group-hover:scale-[1.02]"
                />
                <div className="flex items-center justify-between gap-2 bg-white p-3 text-xs font-bold">
                  <span className="truncate">{attachment.fileName}</span>
                  <ExternalLink size={14} className="shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-black text-[#342f28]">
          Trạng thái xử lý
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as SystemFeedbackStatus)}
            className="min-h-12 cursor-pointer rounded-xl border border-[#d9c9ae] bg-white px-3 outline-none focus:border-[#e9641a] focus:ring-2 focus:ring-[#e9641a]/20"
          >
            {systemFeedbackStatuses.map((value) => (
              <option key={value} value={value}>
                {systemFeedbackStatusLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-[#342f28]">
          Ghi chú nội bộ
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ghi lại nguyên nhân, hướng xử lý hoặc kết quả kiểm tra..."
            className="min-h-12 rounded-xl border border-[#d9c9ae] bg-white px-3 py-3 font-normal outline-none focus:border-[#e9641a] focus:ring-2 focus:ring-[#e9641a]/20"
          />
        </label>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b9470d] px-5 font-black text-white shadow-[0_6px_0_#7f2e05] disabled:cursor-wait disabled:opacity-60"
        >
          <CheckCircle2 size={18} /> {mutation.isPending ? "Đang lưu..." : "Lưu xử lý"}
        </button>
      </div>
      <FormStatus
        status={mutation.isError ? "error" : "idle"}
        message={mutation.error?.message}
        className="mt-3"
      />
    </article>
  );
}

export function SystemFeedbackManager({ initialData }: { initialData: SystemFeedbackPage }) {
  const [status, setStatus] = useState<SystemFeedbackStatus | undefined>();
  const query = useQuery({
    queryKey: [...queryKeys.admin.feedback, status ?? "all"],
    queryFn: () => adminFeedbackApi.list(status),
    initialData: status ? undefined : initialData,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-3">
        <button
          type="button"
          onClick={() => setStatus(undefined)}
          className={cn(
            "min-h-10 cursor-pointer rounded-xl px-4 text-sm font-black",
            status === undefined ? "bg-[#fff0df] text-[#9f3d0b]" : "hover:bg-[#f7f3eb]",
          )}
        >
          Tất cả
        </button>
        {systemFeedbackStatuses.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatus(value)}
            className={cn(
              "min-h-10 cursor-pointer rounded-xl px-4 text-sm font-black",
              status === value ? "bg-[#fff0df] text-[#9f3d0b]" : "hover:bg-[#f7f3eb]",
            )}
          >
            {systemFeedbackStatusLabels[value]}
          </button>
        ))}
        <span className="ml-auto text-sm font-bold text-[#786d60]">{query.data?.total ?? 0} góp ý</span>
      </div>

      {query.isLoading ? (
        <div className="rounded-3xl border bg-white p-10 text-center font-bold text-[#786d60]">
          Đang tải góp ý...
        </div>
      ) : query.isError ? (
        <FormStatus status="error" message={query.error.message} />
      ) : query.data?.items.length ? (
        <div className="space-y-4">
          {query.data.items.map((item) => (
            <FeedbackCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed bg-white p-10 text-center">
          <p className="text-lg font-black">Chưa có góp ý phù hợp</p>
          <p className="mt-2 text-sm text-[#786d60]">Hãy chọn trạng thái khác hoặc quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
