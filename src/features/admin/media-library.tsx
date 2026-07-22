"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, LoaderCircle, Search, X } from "lucide-react";
import { useState } from "react";
import { mediaApi, type MediaItem, type MediaListFilters, type MediaPage } from "@/api/admin/media";
import { contentText, useContent } from "@/content/client";
import { mediaCategoryLabels, mediaTypeLabels, type MediaCategory } from "@/domain/media";
import { MediaCard } from "@/features/admin/media-card";
import { MediaUploadForm } from "@/features/admin/media-upload-form";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type AppliedFilters = Required<Pick<MediaListFilters, "page" | "pageSize">> &
  Pick<MediaListFilters, "type" | "category" | "safetyStatus" | "storageProvider" | "search">;

type Props = {
  initialData: MediaPage;
  canReview: boolean;
  canUpload: boolean;
  canDelete: boolean;
};

const statusLabels = { pending: "Chờ kiểm tra", approved: "Đã duyệt", rejected: "Không phù hợp" };
const providerLabels = { local: "Lưu tại máy", s3: "S3 / R2", cloudinary: "Cloudinary" };
function syncUrl(filters: AppliedFilters) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.safetyStatus) params.set("safetyStatus", filters.safetyStatus);
  if (filters.storageProvider) params.set("storageProvider", filters.storageProvider);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== 16) params.set("pageSize", String(filters.pageSize));
  const query = params.toString();
  window.history.replaceState(null, "", query ? `/admin/media?${query}` : "/admin/media");
}

export function MediaLibrary({ initialData, canReview, canUpload, canDelete }: Props) {
  const content = useContent("admin");
  const queryClient = useQueryClient();
  const initialFilters: AppliedFilters = { page: 1, pageSize: initialData.pageSize };
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState({
    search: "",
    type: "",
    category: "",
    safetyStatus: "",
    storageProvider: "",
  });
  const isInitial =
    filters.page === 1 &&
    filters.pageSize === initialData.pageSize &&
    !filters.type &&
    !filters.category &&
    !filters.safetyStatus &&
    !filters.storageProvider &&
    !filters.search;
  const query = useQuery({
    queryKey: [...queryKeys.admin.media, filters],
    queryFn: () => mediaApi.list(filters),
    initialData: isInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
  });
  const data = query.data ?? initialData;
  function updateCurrentPage(updater: (page: MediaPage) => MediaPage) {
    queryClient.setQueryData<MediaPage>([...queryKeys.admin.media, filters], (current) =>
      current ? updater(current) : current,
    );
  }

  function addMedia(item: MediaItem) {
    updateCurrentPage((current) => ({
      ...current,
      total: current.total + 1,
      items: [item, ...current.items.filter((row) => row.id !== item.id)].slice(0, current.pageSize),
    }));
  }

  function updateMedia(item: MediaItem) {
    updateCurrentPage((current) => ({
      ...current,
      items: current.items.map((row) => (row.id === item.id ? item : row)),
    }));
  }

  function removeMedia(mediaId: string) {
    updateCurrentPage((current) => ({
      ...current,
      total: Math.max(0, current.total - 1),
      items: current.items.filter((row) => row.id !== mediaId),
    }));
  }

  function applyFilters() {
    const next: AppliedFilters = {
      search: draft.search.trim() || undefined,
      type: (draft.type || undefined) as AppliedFilters["type"],
      category: draft.category || undefined,
      safetyStatus: (draft.safetyStatus || undefined) as AppliedFilters["safetyStatus"],
      storageProvider: (draft.storageProvider || undefined) as AppliedFilters["storageProvider"],
      page: 1,
      pageSize: filters.pageSize,
    };
    setFilters(next);
    syncUrl(next);
  }
  function clearFilters() {
    const next: AppliedFilters = { page: 1, pageSize: filters.pageSize };
    setDraft({ search: "", type: "", category: "", safetyStatus: "", storageProvider: "" });
    setFilters(next);
    syncUrl(next);
  }

  const hasFilters = Boolean(
    filters.search || filters.type || filters.category || filters.safetyStatus || filters.storageProvider,
  );

  return (
    <div className="space-y-5">
      {canUpload ? (
        <MediaUploadForm onUploaded={addMedia} />
      ) : (
        <div className="type-supporting rounded-2xl border bg-white p-5 text-[#806d54]">
          {contentText(
            content,
            "media.reviewOnly",
            "Bạn có thể kiểm tra và duyệt tư liệu. Chỉ biên tập viên hoặc quản trị viên mới được tải tệp mới.",
          )}
        </div>
      )}

      <form
        className="grid gap-3 rounded-2xl border bg-white p-4 xl:grid-cols-[minmax(230px,1fr)_150px_190px_170px_170px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="relative">
          <span className="sr-only">Tìm hình ảnh, âm thanh hoặc video</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tìm theo tên tệp hoặc mô tả"
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo loại tệp</span>
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi loại</option>
            {data.facets.types.map((type) => (
              <option key={type} value={type}>
                {mediaTypeLabels[type as keyof typeof mediaTypeLabels] ?? type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo loại nội dung</span>
          <select
            value={draft.category}
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi nhóm</option>
            {data.facets.categories.map((category) => (
              <option key={category} value={category}>
                {mediaCategoryLabels[category as MediaCategory] ?? category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái duyệt</span>
          <select
            value={draft.safetyStatus}
            onChange={(event) => setDraft((current) => ({ ...current, safetyStatus: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi trạng thái</option>
            {data.facets.safetyStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status as keyof typeof statusLabels] ?? status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo nơi lưu trữ</span>
          <select
            value={draft.storageProvider}
            onChange={(event) => setDraft((current) => ({ ...current, storageProvider: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi nơi lưu</option>
            {data.facets.storageProviders.map((provider) => (
              <option key={provider} value={provider}>
                {providerLabels[provider as keyof typeof providerLabels] ?? provider}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={query.isFetching}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-4 font-black text-white disabled:opacity-60"
        >
          {query.isFetching ? <LoaderCircle size={17} className="animate-spin" /> : <Filter size={17} />}
          {query.isFetching ? "Đang lọc..." : "Áp dụng"}
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
          >
            <X size={17} /> Xóa lọc
          </button>
        ) : (
          <span className="hidden xl:block" />
        )}
      </form>

      <section className="relative" aria-busy={query.isFetching}>
        {query.isFetching ? (
          <div className="absolute inset-x-0 -top-1 z-10 h-1 overflow-hidden rounded-full bg-[#f0dfc3]">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#b9470d]" />
          </div>
        ) : null}
        <div className={cn("space-y-4 transition-opacity", query.isFetching && "opacity-65")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="type-supporting font-bold text-[#6f6558]">{data.total} tư liệu</p>
            <label className="type-label flex items-center gap-2 font-bold text-[#6f6558]">
              Hiển thị
              <select
                value={filters.pageSize}
                onChange={(event) => {
                  const next = { ...filters, page: 1, pageSize: Number(event.target.value) };
                  setFilters(next);
                  syncUrl(next);
                }}
                className="min-h-10 rounded-xl border bg-white px-3"
              >
                {[16, 24, 32].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.items.map((item) => (
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

          {!data.items.length ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
              Không tìm thấy tư liệu phù hợp.
            </div>
          ) : null}
          {query.isError ? (
            <div
              role="alert"
              className="type-label rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800"
            >
              {query.error.message}
            </div>
          ) : null}
          {data.totalPages > 1 ? (
            <nav aria-label="Chuyển trang thư viện" className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={filters.page <= 1 || query.isFetching}
                onClick={() => {
                  const next = { ...filters, page: filters.page - 1 };
                  setFilters(next);
                  syncUrl(next);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black disabled:opacity-40"
              >
                <ChevronLeft size={18} /> Trang trước
              </button>
              <span className="type-label font-black text-[#6f6558]">
                Trang {data.page}/{data.totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page >= data.totalPages || query.isFetching}
                onClick={() => {
                  const next = { ...filters, page: filters.page + 1 };
                  setFilters(next);
                  syncUrl(next);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black disabled:opacity-40"
              >
                Trang sau <ChevronRight size={18} />
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </div>
  );
}
