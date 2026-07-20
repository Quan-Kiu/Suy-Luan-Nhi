"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, LoaderCircle, Search, X } from "lucide-react";
import { useState } from "react";
import { contentApi, type ContentEntryListFilters, type ContentEntryPage } from "@/api/content";
import { contentText, useContent } from "@/content/client";
import type { ContentValue } from "@/content/types";
import { contentTypeLabels, type ContentValueType } from "@/domain/content-classification";
import { ContentEntryForm, type ContentEntryItem } from "@/features/admin/content-entry-form";
import { useHydrated } from "@/hooks/use-hydrated";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

const namespaceLabels: Record<string, string> = {
  landing: "Trang giới thiệu",
  auth: "Đăng nhập & tài khoản",
  profile: "Hồ sơ của bé",
  child: "Khu vực của bé",
  game: "Nhiệm vụ & trò chơi",
  parent: "Khu vực phụ huynh",
  admin: "Khu vực quản trị",
  system: "Thông báo dùng chung",
};

function namespaceLabel(namespace: string) {
  return namespaceLabels[namespace] ?? namespace;
}
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
    staleTime: 30_000,
  });
  const data = query.data ?? initialData;
  const hasFilters = Boolean(filters.namespace || filters.category || filters.valueType || filters.search);

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

  function clearFilters() {
    const next: AppliedFilters = { locale: "vi", page: 1, pageSize: filters.pageSize };
    setDraft({ search: "", namespace: "", category: "", valueType: "" });
    setFilters(next);
    syncUrl(next);
  }

  function updateRow(identity: ContentEntryItem, value: ContentValue, active: boolean) {
    queryClient.setQueryData<ContentEntryPage>([...queryKeys.admin.content, filters], (current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.namespace === identity.namespace &&
              item.key === identity.key &&
              item.locale === identity.locale
                ? { ...item, value, active, source: "database" }
                : item,
            ),
          }
        : current,
    );
  }
  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 rounded-2xl border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_190px_190px_170px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          applyFilters({
            search: String(formData.get("search") ?? ""),
            namespace: String(formData.get("namespace") ?? ""),
            category: String(formData.get("category") ?? ""),
            valueType: String(formData.get("valueType") ?? ""),
          });
        }}
      >
        <label className="relative">
          <span className="sr-only">Tìm nội dung</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            name="search"
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder={contentText(
              content,
              "content.searchPlaceholder",
              "Tìm câu chữ hoặc vị trí hiển thị",
            )}
            className="min-h-11 w-full rounded-xl border bg-white py-2 pr-3 pl-10"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo khu vực</span>
          <select
            name="namespace"
            value={draft.namespace}
            onChange={(event) => setDraft((current) => ({ ...current, namespace: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi khu vực</option>
            {data.facets.namespaces.map((namespace) => (
              <option key={namespace} value={namespace}>
                {namespaceLabel(namespace)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo nhóm nội dung</span>
          <select
            name="category"
            value={draft.category}
            onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi nhóm</option>
            {data.facets.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo kiểu dữ liệu</span>
          <select
            name="valueType"
            value={draft.valueType}
            onChange={(event) => setDraft((current) => ({ ...current, valueType: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">Mọi kiểu</option>
            {data.facets.valueTypes.map((valueType) => (
              <option key={valueType} value={valueType}>
                {contentTypeLabels[valueType as ContentValueType] ?? valueType}
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
          <span className="hidden lg:block" />
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
            <p className="text-sm font-bold text-[#6f6558]">{data.total} mục nội dung</p>
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
                {[12, 24, 36].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {data.items.map((row) => (
              <article
                key={`${row.namespace}:${row.key}:${row.locale}`}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#9f3d0b]">{namespaceLabel(row.namespace)}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-[#6f6558]">
                      <span className="rounded-full bg-[#f5f2ec] px-2.5 py-1">Nhóm: {row.category}</span>
                      <span className="rounded-full bg-[#f5f2ec] px-2.5 py-1">
                        {contentTypeLabels[row.valueType]}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#f5f2ec] px-3 py-1 text-xs font-black">
                    {row.source === "database" ? "Đã tùy chỉnh" : "Đang dùng mặc định"}
                  </span>
                </div>
                <details className="mt-3 rounded-xl bg-[#f7f3eb] p-3 text-xs text-[#6f6558]">
                  <summary className="cursor-pointer font-black text-[#342f28]">
                    Thông tin vị trí hiển thị
                  </summary>
                  <p className="mt-2">{row.description}</p>
                  <p className="mt-1 break-all">
                    Mã: {row.namespace}.{row.key} · Ngôn ngữ: {row.locale}
                  </p>
                </details>
                <ContentEntryForm
                  item={row}
                  canEdit={canEdit}
                  interactive={interactive}
                  onSaved={(value, active) => updateRow(row, value, active)}
                />
              </article>
            ))}
          </div>
          {!data.items.length ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-[#806d54]">
              {contentText(content, "content.empty", "Không tìm thấy nội dung phù hợp.")}
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
            <nav aria-label="Phân trang nội dung" className="flex items-center justify-center gap-3">
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
              <span className="text-sm font-black text-[#6f6558]">
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
