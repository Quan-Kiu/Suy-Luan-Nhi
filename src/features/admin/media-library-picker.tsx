"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileAudio,
  ImageIcon,
  LoaderCircle,
  Search,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { mediaApi, type MediaItem, type MediaListFilters } from "@/api/admin/media";
import { mediaCategoryLabels, type MediaCategory } from "@/domain/media";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

export type MediaKind = "image" | "audio" | "video";

type PickerFilters = {
  search?: string;
  category?: string;
  page: number;
};

type Props = {
  open: boolean;
  label: string;
  category: MediaCategory;
  allowedKinds: MediaKind[];
  currentUrl?: string;
  onSelect: (item: MediaItem) => void;
  onClose: () => void;
};

const pageSize = 12;
const statusLabels = {
  pending: "Chờ kiểm tra",
  approved: "Đã kiểm tra",
  rejected: "Không phù hợp",
} as const;

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return <video src={item.url} controls preload="metadata" className="h-full w-full object-contain" />;
  }
  if (item.type === "audio") {
    return (
      <div className="grid h-full place-items-center gap-3 p-4">
        <FileAudio size={34} className="text-[#b9470d]" aria-hidden="true" />
        <audio src={item.url} controls preload="metadata" className="w-full" />
      </div>
    );
  }
  return (
    <Image
      src={item.url}
      fill
      sizes="(min-width: 1280px) 260px, (min-width: 640px) 33vw, 100vw"
      alt={item.altText}
      className="object-contain p-2"
    />
  );
}

export function MediaLibraryPicker({
  open,
  label,
  category,
  allowedKinds,
  currentUrl,
  onSelect,
  onClose,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [draftSearch, setDraftSearch] = useState("");
  const [filters, setFilters] = useState<PickerFilters>({ category, page: 1 });
  const singleKind = allowedKinds.length === 1 ? allowedKinds[0] : undefined;
  const queryFilters: MediaListFilters = {
    type: singleKind,
    category: filters.category,
    search: filters.search,
    page: filters.page,
    pageSize,
  };
  const query = useQuery({
    queryKey: [...queryKeys.admin.media, "picker", queryFilters],
    queryFn: () => mediaApi.list(queryFilters),
    enabled: open,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  const data = query.data;
  const items = (data?.items ?? []).filter((item) => allowedKinds.includes(item.type));
  const categories = [...new Set([category, ...(data?.facets.categories ?? [])])];
  const KindIcon = singleKind === "video" ? Video : singleKind === "audio" ? FileAudio : ImageIcon;

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[min(900px,calc(100dvh-24px))] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#eadfc9] bg-[#fffdf8] shadow-2xl"
      >
        <header className="flex items-start gap-4 border-b border-[#eadfc9] px-4 py-4 sm:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
            <KindIcon size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="type-section-title">
              Chọn từ thư viện
            </h2>
            <p id={descriptionId} className="type-supporting mt-1 text-[#6f6558]">
              Chọn tư liệu đã có cho “{label}”. Bạn vẫn có thể tải tệp mới từ máy nếu chưa có tệp phù hợp.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Đóng thư viện"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#eadfc9] bg-white"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-3 border-b border-[#eadfc9] bg-[#fbf8f2] p-4 sm:grid-cols-[minmax(220px,1fr)_220px_auto] sm:px-6">
          <label className="relative">
            <span className="sr-only">Tìm trong thư viện</span>
            <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                setFilters((current) => ({
                  ...current,
                  search: draftSearch.trim() || undefined,
                  page: 1,
                }));
              }}
              placeholder="Tìm theo tên hoặc mô tả"
              className="min-h-11 w-full rounded-xl border bg-white py-2 pr-3 pl-10"
            />
          </label>
          <label>
            <span className="sr-only">Lọc theo nhóm tư liệu</span>
            <select
              value={filters.category ?? ""}
              onChange={(event) =>
                setFilters((current) => ({ ...current, category: event.target.value || undefined, page: 1 }))
              }
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            >
              <option value="">Mọi nhóm tư liệu</option>
              {categories.map((itemCategory) => (
                <option key={itemCategory} value={itemCategory}>
                  {mediaCategoryLabels[itemCategory as MediaCategory] ?? itemCategory}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={query.isFetching}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                search: draftSearch.trim() || undefined,
                page: 1,
              }))
            }
            className="type-action inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-5 text-white disabled:opacity-60"
          >
            {query.isFetching ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
            Tìm kiếm
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {query.isPending ? (
            <div className="grid min-h-64 place-items-center text-[#806d54]">
              <p className="type-supporting flex items-center gap-2 font-bold">
                <LoaderCircle size={20} className="animate-spin" /> Đang mở thư viện...
              </p>
            </div>
          ) : query.isError ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <p className="type-card-title">Không thể mở thư viện</p>
              <p className="type-supporting mt-2">{query.error.message}</p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="type-action mt-4 min-h-10 rounded-xl border border-red-300 bg-white px-4"
              >
                Thử lại
              </button>
            </div>
          ) : items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const selected = item.url === currentUrl;
                const rejected = item.safetyStatus === "rejected";
                return (
                  <article
                    key={item.id}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-white transition",
                      selected ? "border-[#b9470d] ring-2 ring-[#f2b486]" : "border-[#eadfc9]",
                      rejected && "opacity-60",
                    )}
                  >
                    <div className="relative h-36 bg-[#f5f0e6]">
                      <MediaPreview item={item} />
                      {selected ? (
                        <span className="type-caption absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-[#b9470d] px-2 py-1 font-black text-white">
                          <Check size={13} /> Đang dùng
                        </span>
                      ) : null}
                    </div>
                    <div className="space-y-3 p-3">
                      <div>
                        <p className="type-label truncate font-black text-[#342f28]" title={item.fileName}>
                          {item.fileName}
                        </p>
                        <p className="type-caption mt-1 line-clamp-2 text-[#806d54]">{item.altText}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="type-caption rounded-full bg-[#f5f2ec] px-2 py-1 font-black">
                          {mediaCategoryLabels[item.category as MediaCategory] ?? item.category}
                        </span>
                        <span
                          className={cn(
                            "type-caption rounded-full px-2 py-1 font-black",
                            rejected ? "bg-red-50 text-red-700" : "bg-[#edf4df] text-[#557143]",
                          )}
                        >
                          {statusLabels[item.safetyStatus]}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={rejected || selected}
                        onClick={() => onSelect(item)}
                        className="type-action min-h-10 w-full rounded-xl bg-[#b9470d] px-3 text-white disabled:bg-[#d8d0c4] disabled:text-[#756c60]"
                      >
                        {selected ? "Đang được chọn" : rejected ? "Không thể sử dụng" : "Chọn tư liệu này"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#d8c8ac] bg-[#fbf8f2] p-6 text-center">
              <div>
                <KindIcon className="mx-auto text-[#aa9272]" size={34} aria-hidden="true" />
                <p className="type-card-title mt-3">Chưa có tư liệu phù hợp</p>
                <p className="type-supporting mt-2 text-[#806d54]">
                  Hãy đổi từ khóa, chọn nhóm khác hoặc đóng thư viện để tải tệp mới.
                </p>
              </div>
            </div>
          )}
        </div>

        {data && data.totalPages > 1 ? (
          <footer className="flex items-center justify-center gap-3 border-t border-[#eadfc9] bg-white px-4 py-3">
            <button
              type="button"
              disabled={filters.page <= 1 || query.isFetching}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
              className="type-action inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 disabled:opacity-40"
            >
              <ChevronLeft size={17} /> Trước
            </button>
            <span className="type-label font-black text-[#6f6558]">
              Trang {data.page}/{data.totalPages}
            </span>
            <button
              type="button"
              disabled={filters.page >= data.totalPages || query.isFetching}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              className="type-action inline-flex min-h-10 items-center gap-1 rounded-xl border px-3 disabled:opacity-40"
            >
              Sau <ChevronRight size={17} />
            </button>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
