"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, Trash2, XCircle } from "lucide-react";
import Image from "next/image";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";

type Action = "approve" | "reject" | "delete";

const safetyStatusLabels: Record<string, string> = {
  pending: "Chờ kiểm tra",
  approved: "Đã duyệt",
  rejected: "Không phù hợp",
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
      if (result.action === "delete") onDeleted(item.id);
      else onUpdated(result.updated);
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
          <span className="rounded-full bg-[#f5f2ec] px-2 py-1 text-[10px] font-black">
            {safetyStatusLabels[item.safetyStatus] ?? item.safetyStatus}
          </span>
          <div className="flex gap-1">
            {canReview ? (
              <>
                <button
                  type="button"
                  aria-label={contentText(content, "media.approve", "Duyệt tư liệu")}
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
                  aria-label={contentText(content, "media.reject", "Đánh dấu tư liệu không phù hợp")}
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
                aria-label={contentText(content, "media.delete", "Xóa tư liệu")}
                disabled={mutation.isPending}
                onClick={() => {
                  if (
                    window.confirm(contentText(content, "media.deleteConfirm", "Xóa vĩnh viễn tư liệu này?"))
                  )
                    mutation.mutate("delete");
                }}
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
          <summary className="cursor-pointer font-black">Đường dẫn kỹ thuật</summary>
          <code className="mt-2 block break-all">{item.url}</code>
        </details>
      </div>
    </article>
  );
}
