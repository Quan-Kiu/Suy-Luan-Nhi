"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { contentApi, type ContentEntryListFilters, type ContentEntryPage } from "@/api/content";
import { contentText, useContent } from "@/content/client";
import type { ContentValue } from "@/content/types";
import { contentTypeLabels, type ContentValueType } from "@/domain/content-classification";
import {
  contentAreaOptions,
  contentPreviewText,
  getContentAreaMeta,
  getContentCategoryLabel,
  getContentLocationSummary,
  getContentPurpose,
} from "@/domain/content-presentation";
import { ContentEntryForm, type ContentEntryItem } from "@/features/admin/content-entry-form";
import { useHydrated } from "@/hooks/use-hydrated";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type AppliedFilters = Required<Pick<ContentEntryListFilters, "locale" | "page" | "pageSize">> &
  Pick<ContentEntryListFilters, "namespace" | "category" | "valueType" | "search">;

type Props = {
  initialData: ContentEntryPage;
  initialFilters?: ContentEntryListFilters;
  canEdit: boolean;
};

function syncUrl(filters: AppliedFilters) {
  const params = new URLSearchParams();
  if (filters.namespace) params.set("namespace", filters.namespace);
  if (filters.category) params.set("category", filters.category);
  if (filters.valueType) params.set("valueType", filters.valueType);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== 12) params.set("pageSize", String(filters.pageSize));
  const query = params.toString();
  window.history.replaceState(null, "", query ? `/admin/content?${query}` : "/admin/content");
}
function ContentStudioSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-3xl border border-[#eadfc9] bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-28 rounded-full bg-[#efe7da]" />
            <div className="h-6 w-36 rounded-full bg-[#efe7da]" />
          </div>
          <div className="mt-4 h-4 w-2/3 rounded bg-[#efe7da]" />
          <div className="mt-3 h-20 rounded-2xl bg-[#f5f2ec]" />
          <div className="mt-4 h-12 rounded-2xl bg-[#efe7da]" />
        </div>
      ))}
    </div>
  );
}

export function ContentManager({ initialData, initialFilters: providedFilters = {}, canEdit }: Props) {
  const content = useContent("admin");
  const queryClient = useQueryClient();
  const interactive = useHydrated();
  const initialFilters: AppliedFilters = {
    locale: providedFilters.locale ?? "vi",
    namespace: providedFilters.namespace,
    category: providedFilters.category,
    valueType: providedFilters.valueType,
    search: providedFilters.search,
    page: initialData.page,
    pageSize: initialData.pageSize,
  };
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState({
    search: providedFilters.search ?? "",
    namespace: providedFilters.namespace ?? "",
    category: providedFilters.category ?? "",
    valueType: providedFilters.valueType ?? "",
  });
  const isInitial = JSON.stringify(filters) === JSON.stringify(initialFilters);
  const query = useQuery({
    queryKey: [...queryKeys.admin.content, filters],
    queryFn: () => contentApi.listAdmin(filters),
    initialData: isInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
  });
  const data = query.data ?? initialData;
  const hasFilters = Boolean(filters.namespace || filters.category || filters.valueType || filters.search);
  const visibleAreas = contentAreaOptions.filter((area) => data.facets.namespaces.includes(area.value));

  function applyFilters(values = draft) {
    const next: AppliedFilters = {
      locale: "vi",
      namespace: values.namespace || undefined,
      category: values.category || undefined,
      valueType: (values.valueType || undefined) as ContentValueType | undefined,
      search: values.search.trim() || undefined,
      page: 1,
      pageSize: filters.pageSize,
    };
    setFilters(next);
    syncUrl(next);
  }

  function chooseArea(namespace: string) {
    const nextDraft = { ...draft, namespace, category: "" };
    setDraft(nextDraft);
    applyFilters(nextDraft);
  }

  function clearFilters() {
    const next: AppliedFilters = { locale: "vi", page: 1, pageSize: filters.pageSize };
    setDraft({ search: "", namespace: "", category: "", valueType: "" });
    setFilters(next);
    syncUrl(next);
  }

  function updateRow(identity: ContentEntryItem, value: ContentValue, source: "default" | "database") {
    queryClient.setQueryData<ContentEntryPage>([...queryKeys.admin.content, filters], (current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.namespace === identity.namespace &&
              item.key === identity.key &&
              item.locale === identity.locale
                ? { ...item, value, active: true, source }
                : item,
            ),
          }
        : current,
    );
  }
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5d8c2] bg-[#fffaf0] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#b9470d]">
            <Sparkles size={21} />
          </span>
          <div>
            <h2 className="text-xl font-black text-[#342f28]">Chọn nơi cần sửa câu chữ</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6f6558]">
              Bắt đầu từ khu vực người dùng đang nhìn thấy. Mã kỹ thuật chỉ nằm trong phần thông tin nâng cao.
            </p>
          </div>
        </div>
        <div className="-mx-1 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
          {visibleAreas.map((area) => {
            const active = filters.namespace === area.value;
            return (
              <button
                key={area.value}
                type="button"
                aria-pressed={active}
                onClick={() => chooseArea(active ? "" : area.value)}
                className={cn(
                  "min-h-20 min-w-[16rem] snap-start rounded-2xl border p-4 text-left transition sm:min-w-0",
                  active
                    ? "border-[#d85b18] bg-[#fff0df] shadow-sm"
                    : "border-[#e5d8c2] bg-white hover:border-[#d7b995] hover:bg-[#fffdf8]",
                )}
              >
                <span className="block font-black text-[#3f392f]">{area.shortLabel}</span>
                <span className="mt-1 block text-xs leading-5 text-[#6f6558]">{area.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      {!canEdit ? (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <p className="font-black">Bạn chỉ có thể xem, chưa thể sửa</p>
          <p className="mt-1">
            Bạn có thể tìm và đối chiếu câu chữ. Chỉ người phụ trách biên tập hoặc quản trị viên mới có thể
            thay đổi nội dung.
          </p>
        </section>
      ) : null}

      <form
        className="space-y-4 rounded-3xl border border-[#e5d8c2] bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#3f392f]">Tìm câu chữ</span>
            <span className="relative block">
              <Search className="absolute top-3.5 left-3 text-[#887b6c]" size={18} />
              <input
                name="search"
                value={draft.search}
                onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
                placeholder={contentText(
                  content,
                  "content.searchPlaceholder",
                  "Ví dụ: đăng nhập, lưu thay đổi, chưa có dữ liệu",
                )}
                className="min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] py-2 pr-4 pl-10 outline-none focus:border-[#e9641a]"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#3f392f]">Khu vực hiển thị</span>
            <select
              name="namespace"
              value={draft.namespace}
              onChange={(event) =>
                setDraft((current) => ({ ...current, namespace: event.target.value, category: "" }))
              }
              className="min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] px-4 outline-none focus:border-[#e9641a]"
            >
              <option value="">Tất cả khu vực</option>
              {visibleAreas.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={query.isFetching}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#3f392f] px-5 font-black text-white disabled:opacity-60"
          >
            {query.isFetching ? <LoaderCircle size={18} className="animate-spin" /> : <Filter size={18} />}
            {query.isFetching ? "Đang tìm..." : "Tìm nội dung"}
          </button>
        </div>

        <details className="rounded-2xl bg-[#f7f3eb] p-4">
          <summary className="cursor-pointer font-black text-[#4f463b]">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal size={17} /> Bộ lọc thêm
            </span>
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black text-[#3f392f]">Phần trên màn hình</span>
              <select
                name="category"
                value={draft.category}
                onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                className="min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-white px-4 outline-none focus:border-[#e9641a]"
              >
                <option value="">Tất cả các phần</option>
                {data.facets.categories.map((category) => (
                  <option key={category} value={category}>
                    {getContentCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-black text-[#3f392f]">Loại câu chữ</span>
              <select
                name="valueType"
                value={draft.valueType}
                onChange={(event) => setDraft((current) => ({ ...current, valueType: event.target.value }))}
                className="min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-white px-4 outline-none focus:border-[#e9641a]"
              >
                <option value="">Tất cả loại câu chữ</option>
                {data.facets.valueTypes.map((valueType) => (
                  <option key={valueType} value={valueType}>
                    {contentTypeLabels[valueType as ContentValueType] ?? "Nội dung"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-4 font-black text-[#5f5548]"
          >
            <X size={17} /> Xóa bộ lọc
          </button>
        ) : null}
      </form>
      <section className="relative space-y-4" aria-busy={query.isFetching}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-[#342f28]">{data.total} nội dung phù hợp</p>
            <p className="mt-1 text-sm text-[#6f6558]">
              {filters.namespace
                ? `Đang xem ${getContentAreaMeta(filters.namespace).label.toLocaleLowerCase("vi")}.`
                : "Đang xem câu chữ ở tất cả khu vực."}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-[#6f6558]">
            Mỗi trang
            <select
              value={filters.pageSize}
              onChange={(event) => {
                const next = { ...filters, page: 1, pageSize: Number(event.target.value) };
                setFilters(next);
                syncUrl(next);
              }}
              className="min-h-10 rounded-xl border border-[#d9c9ae] bg-white px-3"
            >
              {[12, 24, 36].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div aria-live="polite" className="sr-only">
          {query.isFetching
            ? "Đang cập nhật danh sách nội dung"
            : `Đã hiển thị ${data.items.length} nội dung`}
        </div>

        {query.isLoading ? <ContentStudioSkeleton /> : null}

        {query.isError ? (
          <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900">
            <p className="text-lg font-black">Chưa tải được danh sách câu chữ</p>
            <p className="mt-2 text-sm leading-6">
              Kiểm tra kết nối rồi thử tải lại. Các thay đổi trước đó không bị mất.
            </p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-4 min-h-11 rounded-xl bg-red-700 px-4 font-black text-white"
            >
              Thử tải lại
            </button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError ? (
          <div className={cn("space-y-4 transition-opacity", query.isFetching && "opacity-65")}>
            {data.items.map((row) => {
              const area = getContentAreaMeta(row.namespace);
              const purpose = getContentPurpose(row.key, row.value);
              const categoryLabel = getContentCategoryLabel(row.category);
              return (
                <article
                  key={`${row.namespace}:${row.key}:${row.locale}`}
                  className="rounded-3xl border border-[#e5d8c2] bg-white p-5 shadow-[0_8px_24px_rgba(76,55,31,0.05)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#9f3d0b]">
                        {area.shortLabel} <span aria-hidden="true">›</span> {categoryLabel}
                      </p>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6f6558]">
                        {getContentLocationSummary(row.namespace, row.category, row.key, row.value)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-black">
                      <span className="rounded-full bg-[#eef4e4] px-3 py-1.5 text-[#557047]">
                        {purpose.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1.5",
                          row.source === "database"
                            ? "bg-[#fff0df] text-[#9f3d0b]"
                            : "bg-[#f5f2ec] text-[#6f6558]",
                        )}
                      >
                        {row.source === "database" ? "Đã chỉnh riêng" : "Nội dung mặc định"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#eadfc9] bg-[#fffaf0] p-4">
                    <p className="flex items-center gap-2 text-xs font-black tracking-wide text-[#756b60] uppercase">
                      <Eye size={15} /> Người dùng đang nhìn thấy
                    </p>
                    <p className="mt-2 text-base leading-7 font-bold whitespace-pre-wrap text-[#342f28]">
                      {contentPreviewText(row.value)}
                    </p>
                  </div>

                  <details className="mt-4 rounded-xl bg-[#f7f3eb] p-3 text-xs text-[#6f6558]">
                    <summary className="cursor-pointer font-black text-[#4f463b]">
                      Thông tin dành cho đội kỹ thuật
                    </summary>
                    <p className="mt-2 leading-5">{row.description}</p>
                    <p className="mt-1 font-mono break-all">
                      {row.namespace}.{row.key} · {row.locale}
                    </p>
                  </details>

                  <ContentEntryForm
                    item={row}
                    canEdit={canEdit}
                    interactive={interactive}
                    onSaved={(value) => updateRow(row, value, "database")}
                    onReset={(value) => updateRow(row, value, "default")}
                  />
                </article>
              );
            })}

            {!data.items.length ? (
              <div className="rounded-3xl border border-dashed border-[#d9c9ae] bg-white p-8 text-center">
                <p className="text-lg font-black text-[#342f28]">Chưa tìm thấy câu chữ phù hợp</p>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6f6558]">
                  Thử dùng từ người dùng thật sự nhìn thấy, chọn khu vực khác hoặc xóa bộ lọc hiện tại.
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 min-h-11 rounded-xl border border-[#d9c9ae] bg-white px-4 font-black text-[#4f463b]"
                  >
                    Xem tất cả nội dung
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {data.totalPages > 1 ? (
          <nav
            aria-label="Chuyển trang câu chữ"
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <button
              type="button"
              disabled={filters.page <= 1 || query.isFetching}
              onClick={() => {
                const next = { ...filters, page: filters.page - 1 };
                setFilters(next);
                syncUrl(next);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-4 font-black disabled:opacity-40"
            >
              <ChevronLeft size={18} /> Trang trước
            </button>
            <span className="text-sm font-black text-[#6f6558]">
              Trang {data.page} trên {data.totalPages}
            </span>
            <button
              type="button"
              disabled={filters.page >= data.totalPages || query.isFetching}
              onClick={() => {
                const next = { ...filters, page: filters.page + 1 };
                setFilters(next);
                syncUrl(next);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-4 font-black disabled:opacity-40"
            >
              Trang sau <ChevronRight size={18} />
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
