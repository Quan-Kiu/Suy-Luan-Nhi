"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, Copy, LoaderCircle, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { mediaCategoryLabels, type MediaCategory } from "@/domain/media";
import { queryKeys } from "@/lib/query/keys";

type Action = "approve" | "reject" | "delete";

const safetyStatusLabels: Record<string, string> = {
  pending: "Chờ kiểm tra",
  approved: "Đã kiểm tra",
  rejected: "Cần thay",
};

export function MediaCard({
  item,
  canReview,
  canDelete,
  onUpdated,
  onDeleted,
  eagerImage = false,
}: {
  item: MediaItem;
  canReview: boolean;
  canDelete: boolean;
  onUpdated: (item: MediaItem) => void;
  onDeleted: (mediaId: string) => void;
  eagerImage?: boolean;
}) {
  const content = useContent("admin");
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      toast.success(contentText(content, "media.copySuccess", "Đã sao chép liên kết"));

      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopied(false), 2_000);
    } catch {
      toast.error(contentText(content, "media.copyError", "Không thể sao chép liên kết"));
    }
  }
  const mutation = useMutation({
    mutationFn: async (action: Action) => {
      if (action === "delete") {
        await mediaApi.remove(item.id);
        return { action } as const;
      }
      const updated = await mediaApi.review(item.id, action === "approve");
      return { action, updated } as const;
    },
    onSuccess: (result) => {
      if (result.action === "delete") {
        setDeleteOpen(false);
        onDeleted(item.id);
        toast.success(contentText(content, "media.deleteSuccess", "Đã xóa tệp"));
        void queryClient.invalidateQueries({ queryKey: queryKeys.admin.feedback });
      } else onUpdated(result.updated);
    },
  });

  const deleteErrorMessage =
    mutation.isError && mutation.variables === "delete" ? mutation.error.message : undefined;

  function openDeleteDialog() {
    mutation.reset();
    setDeleteOpen(true);
  }

  function closeDeleteDialog() {
    mutation.reset();
    setDeleteOpen(false);
  }

  return (
    <article className="overflow-hidden rounded-2xl border bg-white">
      <div className="relative grid h-44 place-items-center bg-[#f6f2ea]">
        {item.type === "image" ? (
          <Image
            src={item.url}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            loading={eagerImage ? "eager" : "lazy"}
            alt={item.altText}
            className="object-contain"
          />
        ) : item.type === "video" ? (
          <video controls preload="metadata" src={item.url} className="h-full w-full object-contain" />
        ) : (
          <audio controls src={item.url} className="w-[90%]" />
        )}
      </div>
      <div className="p-4">
        <p className="type-card-title truncate" title={item.fileName}>
          {item.fileName}
        </p>
        <p className="type-caption mt-1 line-clamp-2 text-[#806d54]">{item.altText}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className="type-caption rounded-full bg-[#f5f2ec] px-2 py-1 font-black">
              {mediaCategoryLabels[item.category as MediaCategory] ?? item.category}
            </span>
            <span className="type-caption rounded-full bg-[#f5f2ec] px-2 py-1 font-black">
              {safetyStatusLabels[item.safetyStatus] ?? item.safetyStatus}
            </span>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={contentText(
                content,
                copied ? "media.copySuccess" : "media.copyLink",
                copied ? "Đã sao chép liên kết" : "Sao chép liên kết",
              )}
              title={contentText(
                content,
                copied ? "media.copySuccess" : "media.copyLink",
                copied ? "Đã sao chép liên kết" : "Sao chép liên kết",
              )}
              onClick={copyLink}
              className="grid size-11 place-items-center rounded-xl border text-sky-700 transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
            </button>
            {canReview ? (
              <>
                <button
                  type="button"
                  aria-label={contentText(content, "media.approve", "Đánh dấu phù hợp")}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("approve")}
                  className="grid size-11 place-items-center rounded-xl border text-green-700 disabled:opacity-50"
                >
                  {mutation.isPending && mutation.variables === "approve" ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={contentText(content, "media.reject", "Đánh dấu cần thay")}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("reject")}
                  className="grid size-11 place-items-center rounded-xl border text-red-700 disabled:opacity-50"
                >
                  {mutation.isPending && mutation.variables === "reject" ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <XCircle size={17} />
                  )}
                </button>
              </>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                aria-label={contentText(content, "media.delete", "Xóa tệp")}
                disabled={mutation.isPending}
                onClick={openDeleteDialog}
                className="grid size-11 place-items-center rounded-xl border text-red-700 disabled:opacity-50"
              >
                {mutation.isPending && mutation.variables === "delete" ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>
            ) : null}
          </div>
        </div>
        <FormStatus
          status={mutation.isError && mutation.variables !== "delete" ? "error" : "idle"}
          message={mutation.variables !== "delete" ? mutation.error?.message : undefined}
          className="mt-3"
        />
        <details className="type-caption mt-3 rounded-lg bg-[#f5f2ec] p-2">
          <summary className="cursor-pointer font-black">Thông tin tệp</summary>
          <p className="mt-2 font-bold">Nơi lưu: {item.storageProvider}</p>
          <code className="mt-1 block break-all">{item.url}</code>
        </details>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Xóa tệp này?"
        description={
          item.category === "feedback-attachment"
            ? contentText(
                content,
                "media.deleteFeedbackConfirm",
                "Ảnh sẽ bị xóa khỏi góp ý đang đính kèm và không thể khôi phục.",
              )
            : contentText(
                content,
                "media.deleteConfirm",
                "Tệp sẽ bị xóa vĩnh viễn nếu chưa được dùng trong nhiệm vụ hoặc bài viết.",
              )
        }
        confirmLabel={deleteErrorMessage ? "Thử xóa lại" : "Xóa tệp"}
        pendingLabel="Đang xóa..."
        tone="danger"
        pending={mutation.isPending && mutation.variables === "delete"}
        errorMessage={deleteErrorMessage}
        onClose={closeDeleteDialog}
        onConfirm={() => mutation.mutate("delete")}
      />
    </article>
  );
}
