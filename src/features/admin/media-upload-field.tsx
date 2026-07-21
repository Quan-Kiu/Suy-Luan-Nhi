"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileAudio, ImageIcon, LoaderCircle, UploadCloud, Video } from "lucide-react";
import Image from "next/image";
import { useId, useRef } from "react";
import { toast } from "sonner";
import { mediaApi } from "@/api/admin/media";
import {
  getImageUploadPolicySummary,
  validateImageFileForCategory,
} from "@/features/admin/media-file-validation";
import type { MediaCategory } from "@/domain/media";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type MediaKind = "image" | "audio" | "video";

type Props = {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  category: MediaCategory;
  altText: string;
  accept?: string;
  allowedKinds?: MediaKind[];
  description?: string;
  error?: string;
  compact?: boolean;
};

const defaultAccept = "image/png,image/jpeg,image/webp,image/gif,image/avif";
function previewKind(url: string): MediaKind {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|mov)$/.test(clean)) return "video";
  if (/\.(mp3|wav|ogg|m4a)$/.test(clean)) return "audio";
  return "image";
}

function Preview({ url, label }: { url: string; label: string }) {
  const kind = previewKind(url);
  if (kind === "video") {
    return (
      <video src={url} controls preload="metadata" className="h-32 w-full rounded-xl bg-black object-cover" />
    );
  }
  if (kind === "audio") {
    return <audio src={url} controls preload="metadata" className="w-full" />;
  }
  return (
    <div className="relative h-32 overflow-hidden rounded-xl bg-[#f5f0e6]">
      <Image src={url} fill sizes="320px" alt={label} className="object-cover" />
    </div>
  );
}
export function MediaUploadField({
  label,
  value = "",
  onChange,
  category,
  altText,
  accept = defaultAccept,
  allowedKinds = ["image"],
  description = "Chọn tệp từ máy. Hệ thống sẽ tự tải lên và gắn vào nội dung.",
  error,
  compact = false,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const policiesQuery = useQuery({
    queryKey: queryKeys.admin.mediaUploadPolicies,
    queryFn: mediaApi.getUploadPolicies,
    staleTime: 5 * 60 * 1000,
  });
  const policySummary = getImageUploadPolicySummary(category, policiesQuery.data);
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      await validateImageFileForCategory(file, category, policiesQuery.data);
      return mediaApi.upload(file, altText.trim() || label, category);
    },
    onSuccess: (item) => {
      if (!allowedKinds.includes(item.type)) {
        toast.error("Tệp này chưa đúng loại cần dùng. Hãy chọn tệp khác.");
        return;
      }
      onChange(item.url);
      if (inputRef.current) inputRef.current.value = "";
      toast.success("Đã thêm tệp vào nội dung");
    },
  });
  const KindIcon = allowedKinds.includes("video")
    ? Video
    : allowedKinds.includes("audio")
      ? FileAudio
      : ImageIcon;

  return (
    <div className={cn("space-y-2", compact && "rounded-xl border bg-[#fbf8f2] p-3")}>
      <div>
        <label htmlFor={inputId} className="block text-sm font-black text-[#342f28]">
          {label}
        </label>
        <p className="mt-1 text-xs leading-5 text-[#6f6558]">{description}</p>
      </div>
      {value ? <Preview url={value} label={altText || label} /> : null}
      <label
        htmlFor={inputId}
        className={cn(
          "flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d5c09b] bg-white px-4 text-sm font-black transition hover:border-[#e9641a] hover:bg-[#fff7eb]",
          mutation.isPending && "pointer-events-none opacity-60",
        )}
      >
        {mutation.isPending ? <LoaderCircle size={18} className="animate-spin" /> : <UploadCloud size={18} />}
        {mutation.isPending ? "Đang tải lên..." : value ? "Thay tệp khác" : "Chọn tệp để tải lên"}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) mutation.mutate(file);
        }}
      />
      {policySummary ? (
        <p className="text-xs font-bold text-[#6f6558]">Yêu cầu đối với ảnh: {policySummary}.</p>
      ) : null}
      {value ? (
        <p className="flex items-center gap-2 text-xs font-bold break-all text-green-700">
          <CheckCircle2 size={15} className="shrink-0" /> Tệp đã được gắn tự động vào nội dung.
        </p>
      ) : (
        <p className="flex items-center gap-2 text-xs text-[#806d54]">
          <KindIcon size={15} /> Chưa có tệp nào được chọn.
        </p>
      )}
      {mutation.isError ? (
        <p role="alert" className="text-sm font-bold text-red-700">
          {mutation.error.message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
