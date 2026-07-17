"use client";

import { useState } from "react";
import type { MediaItem } from "@/api/admin/media";
import { contentText, useContent } from "@/content/client";
import { MediaCard } from "@/features/admin/media-card";
import { MediaUploadForm } from "@/features/admin/media-upload-form";

export function MediaLibrary({
  items,
  canReview,
  canUpload,
  canDelete,
}: {
  items: MediaItem[];
  canReview: boolean;
  canUpload: boolean;
  canDelete: boolean;
}) {
  const content = useContent("admin");
  const [rows, setRows] = useState(items);

  function addMedia(item: MediaItem) {
    setRows((current) => [item, ...current.filter((row) => row.id !== item.id)]);
  }

  function updateMedia(item: MediaItem) {
    setRows((current) => current.map((row) => (row.id === item.id ? item : row)));
  }

  function removeMedia(mediaId: string) {
    setRows((current) => current.filter((row) => row.id !== mediaId));
  }

  return (
    <div>
      {canUpload ? (
        <MediaUploadForm onUploaded={addMedia} />
      ) : (
        <div className="rounded-2xl border bg-white p-5 text-sm text-[#806d54]">
          {contentText(
            content,
            "media.reviewOnly",
            "Bạn có thể kiểm tra và duyệt tư liệu. Chỉ biên tập viên hoặc quản trị viên mới được tải tệp mới.",
          )}
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            canReview={canReview}
            canDelete={canDelete}
            onUpdated={updateMedia}
            onDeleted={removeMedia}
          />
        ))}
      </div>
    </div>
  );
}
