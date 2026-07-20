"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ChevronLeft, ChevronRight, Edit3, Filter, LoaderCircle, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  adminResourcesApi,
  type AdminResourceFilters,
  type AdminResourceItem,
  type AdminResourcePage,
} from "@/api/admin/resources";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ageGroupCodes } from "@/domain/age-groups";
import {
  parentResourceCategories,
  parentResourceCategoryLabels,
  parentResourceTypes,
  parentResourceTypeLabels,
} from "@/domain/parent-resources";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

const statusLabels = { draft: "Bản nháp", published: "Đang hiển thị", archived: "Đã lưu trữ" } as const;
type AppliedFilters = Required<Pick<AdminResourceFilters, "page" | "pageSize">> & AdminResourceFilters;
function syncUrl(filters: AppliedFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && !((key === "page" && value === 1) || (key === "pageSize" && value === 10))) {
      params.set(key, String(value));
    }
  }
  const query = params.toString();
  window.history.replaceState(null, "", query ? `/admin/resources?${query}` : "/admin/resources");
}

function statusClass(status: AdminResourceItem["status"]) {
  if (status === "published") return "bg-green-100 text-green-800";
  if (status === "archived") return "bg-stone-200 text-stone-700";
  return "bg-amber-100 text-amber-800";
}

export function ResourceListWorkspace({
  initialData,
  initialFilters,
  canEdit,
}: {
  initialData: AdminResourcePage;
  initialFilters: AdminResourceFilters;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const normalizedInitial: AppliedFilters = {
    ...initialFilters,
    page: initialData.page,
    pageSize: initialData.pageSize,
  };
  const [filters, setFilters] = useState(normalizedInitial);
  const [draft, setDraft] = useState({
    search: initialFilters.search ?? "",
    status: initialFilters.status ?? "",
    resourceType: initialFilters.resourceType ?? "",
    category: initialFilters.category ?? "",
    ageGroup: initialFilters.ageGroup ?? "",
  });
  const [archiveTarget, setArchiveTarget] = useState<AdminResourceItem | null>(null);
  const isInitial = JSON.stringify(filters) === JSON.stringify(normalizedInitial);
  const query = useQuery({
    queryKey: [...queryKeys.admin.resources, filters],
    queryFn: () => adminResourcesApi.list(filters),
    initialData: isInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const archiveMutation = useMutation({
    mutationFn: (resourceId: string) => adminResourcesApi.archive(resourceId),
    onSuccess: async () => {
      setArchiveTarget(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.resources });
    },
  });
  const data = query.data ?? initialData;
  const hasFilters = Boolean(
    filters.search || filters.status || filters.resourceType || filters.category || filters.ageGroup,
  );

  function applyFilters() {
    const next: AppliedFilters = {
      search: draft.search.trim() || undefined,
      status: (draft.status || undefined) as AdminResourceFilters["status"],
      resourceType: (draft.resourceType || undefined) as AdminResourceFilters["resourceType"],
      category: (draft.category || undefined) as AdminResourceFilters["category"],
      ageGroup: (draft.ageGroup || undefined) as AdminResourceFilters["ageGroup"],
      page: 1,
      pageSize: filters.pageSize,
    };
    setFilters(next);
    syncUrl(next);
  }
  function clearFilters() {
    const next: AppliedFilters = { page: 1, pageSize: filters.pageSize };
    setDraft({ search: "", status: "", resourceType: "", category: "", ageGroup: "" });
    setFilters(next);
    syncUrl(next);
  }

  function changePage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    syncUrl(next);
  }

  return (
    <div className="space-y-5">
      <form
        className="grid gap-3 rounded-2xl border bg-white p-4 xl:grid-cols-[minmax(220px,1fr)_160px_170px_190px_140px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="relative">
          <span className="sr-only">Tìm tài nguyên</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tìm theo tiêu đề hoặc mã đường dẫn"
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <label>
          <span className="sr-only">Lọc trạng thái</span>
          <select
            value={draft.status}
            onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc loại tài nguyên</span>
          <select
            value={draft.resourceType}
            onChange={(event) => setDraft((current) => ({ ...current, resourceType: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi loại</option>
            {parentResourceTypes.map((type) => (
              <option key={type} value={type}>
                {parentResourceTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc chủ đề</span>
          <select
            value={draft.category}
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi chủ đề</option>
            {parentResourceCategories.map((category) => (
              <option key={category} value={category}>
                {parentResourceCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc nhóm tuổi</span>
          <select
            value={draft.ageGroup}
            onChange={(event) => setDraft((current) => ({ ...current, ageGroup: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi độ tuổi</option>
            {ageGroupCodes.map((ageGroup) => (
              <option key={ageGroup} value={ageGroup}>
                {ageGroup} tuổi
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
            <p className="text-sm font-bold text-[#6f6558]">{data.total} tài nguyên</p>
            <label className="flex items-center gap-2 text-sm font-bold text-[#6f6558]">
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
                {[10, 20, 30].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="relative h-40 bg-[#f5f0e6]">
                  {item.coverUrl ? (
                    <Image
                      src={item.coverUrl}
                      fill
                      sizes="(min-width:1280px) 33vw, 50vw"
                      alt=""
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#9f3d0b]">
                        {parentResourceTypeLabels[item.resourceType]}
                      </p>
                      <h2 className="mt-1 text-lg font-black">{item.title}</h2>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-black",
                        statusClass(item.status),
                      )}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#6f6558]">{item.excerpt}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#6f6558]">
                    <span className="rounded-full bg-[#f5f2ec] px-2 py-1">
                      {parentResourceCategoryLabels[item.category]}
                    </span>
                    <span className="rounded-full bg-[#f5f2ec] px-2 py-1">
                      {item.ageGroups.join(", ")} tuổi
                    </span>
                  </div>
                  {canEdit ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/admin/resources/${item.id}/edit`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border font-black"
                      >
                        <Edit3 size={17} /> Chỉnh sửa
                      </Link>
                      <button
                        type="button"
                        disabled={item.status === "archived"}
                        onClick={() => setArchiveTarget(item)}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 font-black text-amber-800 disabled:opacity-40"
                      >
                        <Archive size={17} /> Lưu trữ
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          {!data.items.length ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-[#806d54]">
              Không tìm thấy tài nguyên phù hợp.
            </div>
          ) : null}
          {query.isError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
            >
              {query.error.message}
            </div>
          ) : null}
          {data.totalPages > 1 ? (
            <nav aria-label="Phân trang tài nguyên" className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={filters.page <= 1 || query.isFetching}
                onClick={() => changePage(filters.page - 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black disabled:opacity-40"
              >
                <ChevronLeft size={18} /> Trang trước
              </button>
              <span className="text-sm font-black text-[#6f6558]">
                Trang {data.page}/{data.totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page >= data.totalPages || query.isFetching}
                onClick={() => changePage(filters.page + 1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black disabled:opacity-40"
              >
                Trang sau <ChevronRight size={18} />
              </button>
            </nav>
          ) : null}
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title="Lưu trữ tài nguyên?"
        description={`“${archiveTarget?.title ?? "Tài nguyên"}” sẽ ngừng hiển thị cho phụ huynh nhưng vẫn được giữ trong hệ thống.`}
        confirmLabel="Lưu trữ"
        pendingLabel="Đang lưu trữ..."
        tone="warning"
        pending={archiveMutation.isPending}
        onClose={() => setArchiveTarget(null)}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget.id)}
      />
    </div>
  );
}
