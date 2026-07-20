"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, LoaderCircle, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  parentResourcesApi,
  type ParentResourceFilters,
  type ParentResourcePage,
} from "@/api/parent-resources";
import { Card, Pill } from "@/components/ui";
import {
  parentResourceCategoryLabels,
  parentResourceTypeLabels,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { cn } from "@/lib/utils";

type Filters = Required<Pick<ParentResourceFilters, "page" | "pageSize">> & ParentResourceFilters;

export function ResourceLibrary({ initialData }: { initialData: ParentResourcePage }) {
  const initialFilters: Filters = { page: 1, pageSize: initialData.pageSize };
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState({ search: "", resourceType: "", category: "" });
  const isInitial =
    filters.page === 1 &&
    filters.pageSize === initialData.pageSize &&
    !filters.search &&
    !filters.resourceType &&
    !filters.category;
  const query = useQuery({
    queryKey: ["parent", "resources", filters],
    queryFn: () => parentResourcesApi.list(filters),
    initialData: isInitial ? initialData : undefined,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
  const data = query.data ?? initialData;
  function applyFilters() {
    setFilters({
      search: draft.search.trim() || undefined,
      resourceType: (draft.resourceType || undefined) as ParentResourceType | undefined,
      category: (draft.category || undefined) as ParentResourceCategory | undefined,
      page: 1,
      pageSize: filters.pageSize,
    });
  }

  function clearFilters() {
    setDraft({ search: "", resourceType: "", category: "" });
    setFilters(initialFilters);
  }

  return (
    <div className="mt-5 space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
        className="grid gap-3 rounded-[24px] border border-[#eadfc9] bg-white/90 p-4 md:grid-cols-[minmax(220px,1fr)_180px_200px_auto_auto]"
      >
        <label className="relative">
          <span className="sr-only">Tìm tài nguyên</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder="Tìm hướng dẫn phù hợp"
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <select
          value={draft.resourceType}
          onChange={(event) => setDraft((current) => ({ ...current, resourceType: event.target.value }))}
          aria-label="Lọc theo loại tài nguyên"
          className="min-h-11 rounded-xl border px-3"
        >
          <option value="">Mọi loại</option>
          {data.facets.resourceTypes.map((type) => (
            <option key={type} value={type}>
              {parentResourceTypeLabels[type as ParentResourceType] ?? type}
            </option>
          ))}
        </select>
        <select
          value={draft.category}
          onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
          aria-label="Lọc theo chủ đề"
          className="min-h-11 rounded-xl border px-3"
        >
          <option value="">Mọi chủ đề</option>
          {data.facets.categories.map((category) => (
            <option key={category} value={category}>
              {parentResourceCategoryLabels[category as ParentResourceCategory] ?? category}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={query.isFetching}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-4 font-black text-white disabled:opacity-60"
        >
          {query.isFetching ? <LoaderCircle size={17} className="animate-spin" /> : <Filter size={17} />}
          {query.isFetching ? "Đang lọc..." : "Áp dụng"}
        </button>
        {filters.search || filters.resourceType || filters.category ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
          >
            <X size={17} /> Xóa lọc
          </button>
        ) : null}
      </form>

      <section className="relative" aria-busy={query.isFetching}>
        {query.isFetching ? (
          <div className="absolute inset-x-0 -top-1 z-10 h-1 overflow-hidden rounded-full bg-[#f0dfc3]">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-[#b9470d]" />
          </div>
        ) : null}
        <div className={cn("grid gap-4 transition-opacity md:grid-cols-3", query.isFetching && "opacity-65")}>
          {data.items.map((item, index) => (
            <Link key={item.id} href={`/parent/resources/${item.slug}`}>
              <Card className="h-full overflow-hidden transition hover:-translate-y-1">
                {item.coverUrl ? (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={item.coverUrl}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      priority={index < 3}
                      alt=""
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <Pill>{parentResourceTypeLabels[item.resourceType]}</Pill>
                    <Pill>{parentResourceCategoryLabels[item.category]}</Pill>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6f604b]">{item.excerpt}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {!data.items.length ? (
          <div className="mt-4 rounded-2xl border bg-white p-8 text-center text-[#806d54]">
            Không tìm thấy tài nguyên phù hợp.
          </div>
        ) : null}
        {query.isError ? (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {query.error.message}
          </div>
        ) : null}
        {data.totalPages > 1 ? (
          <nav
            aria-label="Phân trang tài nguyên phụ huynh"
            className="mt-5 flex items-center justify-center gap-3"
          >
            <button
              type="button"
              disabled={filters.page <= 1 || query.isFetching}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
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
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-white px-4 font-black disabled:opacity-40"
            >
              Trang sau <ChevronRight size={18} />
            </button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}
