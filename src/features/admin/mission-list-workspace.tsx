"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Filter, LoaderCircle, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  adminMissionsApi,
  type AdminMissionListFilters,
  type AdminMissionListItem,
  type AdminMissionPage,
} from "@/api/admin/missions";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { MissionListActions } from "@/features/admin/mission-list-actions";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import { missionStatusLabels } from "@/features/admin/admin-labels";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type WorldOption = { id: string; title: string };
type AppliedFilters = Required<Pick<AdminMissionListFilters, "page" | "pageSize">> &
  Pick<AdminMissionListFilters, "status" | "worldId" | "search">;

type Props = {
  initialData: AdminMissionPage;
  initialFilters: AppliedFilters;
  worlds: WorldOption[];
  canEdit: boolean;
  content: ContentDictionary;
};
function sameFilters(left: AppliedFilters, right: AppliedFilters) {
  return (
    left.status === right.status &&
    left.worldId === right.worldId &&
    left.search === right.search &&
    left.page === right.page &&
    left.pageSize === right.pageSize
  );
}

function syncUrl(filters: AppliedFilters) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.worldId) params.set("worldId", filters.worldId);
  if (filters.status) params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize !== 10) params.set("pageSize", String(filters.pageSize));
  const query = params.toString();
  window.history.replaceState(null, "", query ? `/admin/missions?${query}` : "/admin/missions");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function MissionEditTarget({
  canEdit,
  href,
  className,
  children,
}: {
  canEdit: boolean;
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return canEdit ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}
export function MissionListWorkspace({ initialData, initialFilters, worlds, canEdit, content }: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState({
    search: initialFilters.search ?? "",
    worldId: initialFilters.worldId ?? "",
    status: initialFilters.status ?? "",
  });
  const initialKey = useMemo(() => sameFilters(filters, initialFilters), [filters, initialFilters]);
  const query = useQuery({
    queryKey: [...queryKeys.admin.missions, filters],
    queryFn: () => adminMissionsApi.list(filters),
    initialData: initialKey ? initialData : undefined,
    placeholderData: keepPreviousData,
  });
  const data = query.data ?? initialData;
  const hasFilters = Boolean(filters.search || filters.status || filters.worldId);
  const t = (key: string, fallback: string) => contentText(content, key, fallback);

  function applyFilters() {
    const next: AppliedFilters = {
      search: draft.search.trim() || undefined,
      worldId: draft.worldId || undefined,
      status: draft.status || undefined,
      page: 1,
      pageSize: filters.pageSize,
    };
    setFilters(next);
    syncUrl(next);
  }

  function clearFilters() {
    const next: AppliedFilters = { page: 1, pageSize: filters.pageSize };
    setDraft({ search: "", worldId: "", status: "" });
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
        className="grid gap-3 rounded-2xl border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_220px_210px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="relative">
          <span className="sr-only">Tìm nhiệm vụ</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder={t("missions.search", "Tìm theo tên nhiệm vụ")}
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo thế giới nhiệm vụ</span>
          <select
            value={draft.worldId}
            onChange={(event) => setDraft((current) => ({ ...current, worldId: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">{t("missions.allWorlds", "Mọi thế giới")}</option>
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái</span>
          <select
            value={draft.status}
            onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">{t("missions.allStatuses", "Mọi trạng thái")}</option>
            {Object.entries(missionStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          {query.isFetching ? "Đang lọc..." : t("missions.filter", "Áp dụng")}
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
            <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-[#b9470d]" />
          </div>
        ) : null}
        <div className={cn("space-y-4 transition-opacity", query.isFetching && "opacity-65")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#6f6558]">
              {contentTemplate(content, "missions.resultCount", "{count} nhiệm vụ", { count: data.total })}
            </p>
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

          <div className="grid gap-4 md:hidden">
            {data.items.map((item, index) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <MissionEditTarget
                  canEdit={canEdit}
                  href={`/admin/missions/${item.id}/edit`}
                  className="block"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <Image
                      src={item.coverUrl}
                      fill
                      sizes="(max-width: 767px) calc(100vw - 2rem), 1px"
                      priority={index === 0}
                      alt=""
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-lg font-black">{item.title}</h2>
                        <p className="text-sm text-[#6f6558]">{item.worldTitle}</p>
                      </div>
                      <MissionStatusBadge status={item.status} />
                    </div>
                    <p className="mt-3 text-sm text-[#6f6558]">
                      {contentTemplate(
                        content,
                        "missions.summary",
                        "{questions} câu hỏi · khoảng {minutes} phút",
                        {
                          questions: item.questionCount,
                          minutes: item.estimatedMinutes,
                        },
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[#756b60]">Cập nhật {formatDate(item.updatedAt)}</p>
                  </div>
                </MissionEditTarget>
                {canEdit ? (
                  <div className="border-t px-4 py-3">
                    <MissionListActions missionId={item.id} showLabels />
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
            <table className="min-w-full text-sm">
              <thead className="bg-[#f7f3eb] text-left">
                <tr>
                  <th className="p-3">{t("missions.columnMission", "Nhiệm vụ")}</th>
                  <th className="p-3">{t("missions.columnWorld", "Thế giới")}</th>
                  <th className="p-3">{t("missions.columnStatus", "Trạng thái")}</th>
                  <th className="p-3">{t("missions.columnContent", "Độ dài")}</th>
                  <th className="p-3">{t("missions.columnUpdated", "Cập nhật")}</th>
                  {canEdit ? <th className="p-3">{t("missions.columnActions", "Thao tác")}</th> : null}
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <MissionTableRow key={item.id} item={item} canEdit={canEdit} content={content} />
                ))}
              </tbody>
            </table>
          </div>
          {!data.items.length ? (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <p className="font-black">{t("missions.empty", "Không tìm thấy nhiệm vụ phù hợp.")}</p>
              <p className="mt-2 text-sm text-[#6f6558]">
                {canEdit
                  ? "Thử xóa bộ lọc hoặc tạo một nhiệm vụ mới."
                  : "Thử xóa bộ lọc để xem toàn bộ nhiệm vụ."}
              </p>
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
            <nav aria-label="Phân trang nhiệm vụ" className="flex items-center justify-center gap-3 pt-1">
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
    </div>
  );
}
function MissionTableRow({
  item,
  canEdit,
  content,
}: {
  item: AdminMissionListItem;
  canEdit: boolean;
  content: ContentDictionary;
}) {
  return (
    <tr className="border-t align-middle hover:bg-[#fffdf8]">
      <td className="p-3">
        <MissionEditTarget
          canEdit={canEdit}
          href={`/admin/missions/${item.id}/edit`}
          className="flex min-w-64 items-center gap-3"
        >
          <span className="relative block h-13 w-17 shrink-0 overflow-hidden rounded-xl">
            <Image src={item.coverUrl} fill sizes="68px" alt="" className="object-cover" />
          </span>
          <span>
            <strong className="block">{item.title}</strong>
            <small className="text-[#806d54]">Mã nội bộ: {item.slug}</small>
          </span>
        </MissionEditTarget>
      </td>
      <td className="p-3">{item.worldTitle}</td>
      <td className="p-3">
        <MissionStatusBadge status={item.status} />
      </td>
      <td className="p-3">
        {contentTemplate(content, "missions.summary", "{questions} câu hỏi · {minutes} phút", {
          questions: item.questionCount,
          minutes: item.estimatedMinutes,
        })}
      </td>
      <td className="p-3 text-[#806d54]">{formatDate(item.updatedAt)}</td>
      {canEdit ? (
        <td className="p-3">
          <MissionListActions missionId={item.id} showLabels />
        </td>
      ) : null}
    </tr>
  );
}
