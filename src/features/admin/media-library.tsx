"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

type Media = {
  id: string;
  type: "image" | "audio";
  url: string;
  altText: string;
  fileName: string;
  mimeType: string;
  size: number;
  safetyStatus: "pending" | "approved" | "rejected";
  createdAt: Date;
};

export function MediaLibrary({
  items,
  canReview,
  canUpload,
  canDelete,
}: {
  items: Media[];
  canReview: boolean;
  canUpload: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [pending, setPending] = useState(false);

  async function upload() {
    if (!file || !altText.trim()) {
      toast.error("Hãy chọn tệp và nhập alt text");
      return;
    }
    setPending(true);
    const form = new FormData();
    form.set("file", file);
    form.set("altText", altText);
    try {
      await requestJson<Media>("/api/admin/media", { method: "POST", body: form });
      toast.success("Đã tải media lên storage");
      setFile(null);
      setAltText("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải media");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {canUpload ? (
        <div className="rounded-2xl border bg-white p-5">
          <h2 className="text-xl font-black">Tải media mới</h2>
          <p className="mt-1 text-sm text-[#806d54]">
            Ảnh tối đa 10MB, audio tối đa 20MB. Alt text là bắt buộc.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/wav,audio/ogg"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="min-h-11 rounded-xl border p-2"
            />
            <input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Mô tả hình ảnh hoặc audio"
              className="min-h-11 rounded-xl border px-3"
            />
            <button
              type="button"
              onClick={upload}
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e9641a] px-4 font-black text-white disabled:opacity-50"
            >
              <Upload size={18} />
              {pending ? "Đang tải..." : "Tải lên"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-5 text-sm text-[#806d54]">
          Reviewer có thể duyệt hoặc từ chối media; chỉ content admin và super admin được tải tệp mới.
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border bg-white">
            <div className="grid h-44 place-items-center bg-[#f6f2ea]">
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  width={320}
                  height={220}
                  alt={item.altText}
                  className="h-full w-full object-contain"
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
                  {item.safetyStatus}
                </span>
                <div className="flex gap-1">
                  {canReview ? (
                    <>
                      <button
                        type="button"
                        aria-label="Duyệt media"
                        onClick={async () => {
                          await requestJson(`/api/admin/media/${item.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ approved: true }),
                          });
                          router.refresh();
                        }}
                        className="rounded-lg border p-2 text-green-700"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Từ chối media"
                        onClick={async () => {
                          await requestJson(`/api/admin/media/${item.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ approved: false }),
                          });
                          router.refresh();
                        }}
                        className="rounded-lg border p-2 text-red-700"
                      >
                        <XCircle size={15} />
                      </button>
                    </>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      aria-label="Xóa media"
                      onClick={async () => {
                        if (!confirm("Xóa media này khỏi storage?")) return;
                        await requestJson(`/api/admin/media/${item.id}`, { method: "DELETE" });
                        router.refresh();
                      }}
                      className="rounded-lg border p-2 text-red-700"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
              <code className="mt-3 block rounded-lg bg-[#f5f2ec] p-2 text-[10px] break-all">{item.url}</code>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
