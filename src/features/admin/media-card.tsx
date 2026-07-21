"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { mediaCategoryLabels, type MediaCategory } from "@/domain/media";

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
}: {
  item: MediaItem;
  canReview: boolean;
  canDelete: boolean;
  onUpdated: (item: MediaItem) => void;
  onDeleted: (mediaId: string) => void;
}) {
  const content = useContent("admin");
  const [deleteOpen, setDeleteOpen] = useState(false);
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
      } else onUpdated(result.updated);
    },
  });

  return (
    <article className="overflow-hidden rounded-2xl border bg-white">
      <div className="relative grid h-44 place-items-center bg-[#f6f2ea]">
        {item.type === "image" ? (
          <Image
            src={item.url}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
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
        <p className="truncate font-black" title={item.fileName}>
          {item.fileName}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-[#806d54]">{item.altText}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-[#f5f2ec] px-2 py-1 text-[10px] font-black">
              {mediaCategoryLabels[item.category as MediaCategory] ?? item.category}
            </span>
            <span className="rounded-full bg-[#f5f2ec] px-2 py-1 text-[10px] font-black">
              {safetyStatusLabels[item.safetyStatus] ?? item.safetyStatus}
            </span>
          </div>
          <div className="flex gap-1">
            {canReview ? (
              <>
                <button
                  type="button"
                  aria-label={contentText(content, "media.approve", "Đánh dấu phù hợp")}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("approve")}
                  className="rounded-lg border p-2 text-green-700 disabled:opacity-50"
                >
                  {mutation.isPending && mutation.variables === "approve" ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={contentText(content, "media.reject", "Đánh dấu cần thay")}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate("reject")}
                  className="rounded-lg border p-2 text-red-700 disabled:opacity-50"
                >
                  {mutation.isPending && mutation.variables === "reject" ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <XCircle size={15} />
                  )}
                </button>
              </>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                aria-label={contentText(content, "media.delete", "Xóa tệp")}
                disabled={mutation.isPending}
                onClick={() => setDeleteOpen(true)}
                className="rounded-lg border p-2 text-red-700 disabled:opacity-50"
              >
                {mutation.isPending && mutation.variables === "delete" ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            ) : null}
          </div>
        </div>
        <FormStatus
          status={mutation.isError ? "error" : "idle"}
          message={mutation.error?.message}
          className="mt-3"
        />
        <details className="mt-3 rounded-lg bg-[#f5f2ec] p-2 text-[10px]">
          <summary className="cursor-pointer font-black">Thông tin tệp</summary>
          <p className="mt-2 font-bold">Nơi lưu: {item.storageProvider}</p>
          <code className="mt-1 block break-all">{item.url}</code>
        </details>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Xóa tệp này?"
        description={contentText(
          content,
          "media.deleteConfirm",
          "Tệp sẽ bị xóa vĩnh viễn nếu chưa được dùng trong nhiệm vụ hoặc bài viết.",
        )}
        confirmLabel="Xóa tệp"
        pendingLabel="Đang xóa..."
        tone="danger"
        pending={mutation.isPending && mutation.variables === "delete"}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => mutation.mutate("delete")}
      />
    </article>
  );
}
