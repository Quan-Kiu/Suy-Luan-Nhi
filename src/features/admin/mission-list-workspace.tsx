"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
  ListChecks,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";
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

function formatMissionTimeline(item: AdminMissionListItem) {
  if (item.status === "archived") {
    return `Lưu trữ ${formatDate(item.archivedAt ?? item.updatedAt)}`;
  }
  return `Cập nhật ${formatDate(item.updatedAt)}`;
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
  const archiveView = filters.status === "archived";
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

  function showActiveMissions() {
    const next: AppliedFilters = {
      ...filters,
      status: undefined,
      page: 1,
    };
    setDraft((current) => ({ ...current, status: "" }));
    setFilters(next);
    syncUrl(next);
  }

  function showArchivedMissions() {
    const next: AppliedFilters = {
      ...filters,
      status: "archived",
      page: 1,
    };
    setDraft((current) => ({ ...current, status: "archived" }));
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
      <nav
        aria-label="Xem nhanh danh sách nhiệm vụ"
        className="flex w-fit flex-wrap gap-1 rounded-xl border bg-white p-1"
      >
        <button
          type="button"
          aria-pressed={!archiveView}
          onClick={showActiveMissions}
          className={cn(
            "type-action inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 font-black transition",
            !archiveView ? "bg-[#3f392f] text-white" : "text-[#62594e] hover:bg-[#f7f3eb]",
          )}
        >
          <ListChecks size={17} /> Đang quản lý
        </button>
        <button
          type="button"
          aria-pressed={archiveView}
          onClick={showArchivedMissions}
          className={cn(
            "type-action inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 font-black transition",
            archiveView ? "bg-[#3f392f] text-white" : "text-[#62594e] hover:bg-[#f7f3eb]",
          )}
        >
          <Archive size={17} /> Kho lưu trữ
        </button>
      </nav>

      <form
        className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_210px_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <label className="relative sm:col-span-2 xl:col-span-1">
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
          <span className="sr-only">Lọc theo chủ đề</span>
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
            <option value="">{t("missions.allStatuses", "Mọi trạng thái đang quản lý")}</option>
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
          <span className="hidden xl:block" />
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
            <p className="type-supporting font-bold text-[#6f6558]">
              {archiveView
                ? contentTemplate(
                    content,
                    "missions.archiveResultCount",
                    "{count} nhiệm vụ trong Kho lưu trữ",
                    { count: data.total },
                  )
                : contentTemplate(content, "missions.resultCount", "{count} nhiệm vụ", {
                    count: data.total,
                  })}
            </p>
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
                {[10, 20, 30].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:hidden">
            {data.items.map((item, index) => {
              const archived = item.status === "archived";
              return (
                <article
                  key={item.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white shadow-sm",
                    archived && "border-stone-300 bg-stone-50",
                  )}
                >
                  <MissionEditTarget
                    canEdit={canEdit && !archived}
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
                        className={cn("object-cover", archived && "opacity-75 grayscale-[35%]")}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="type-card-title">{item.title}</h2>
                          <p className="type-supporting text-[#6f6558]">{item.worldTitle}</p>
                        </div>
                        <MissionStatusBadge status={item.status} />
                      </div>
                      <p className="type-supporting mt-3 text-[#6f6558]">
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
                      <p className="type-caption mt-1 text-[#756b60]">{formatMissionTimeline(item)}</p>
                    </div>
                  </MissionEditTarget>
                  {canEdit ? (
                    <div className="border-t px-4 py-3">
                      <MissionListActions missionId={item.id} status={item.status} showLabels />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border bg-white md:block">
            <table className="type-supporting min-w-full">
              <thead className="bg-[#f7f3eb] text-left">
                <tr>
                  <th className="p-3">{t("missions.columnMission", "Nhiệm vụ")}</th>
                  <th className="p-3">{t("missions.columnWorld", "Thế giới")}</th>
                  <th className="p-3">{t("missions.columnStatus", "Trạng thái")}</th>
                  <th className="p-3">{t("missions.columnContent", "Độ dài")}</th>
                  <th className="p-3">{t("missions.columnTimeline", "Thời gian")}</th>
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
              <p className="font-black">
                {archiveView
                  ? t("missions.archiveEmpty", "Kho lưu trữ đang trống.")
                  : t("missions.empty", "Không tìm thấy nhiệm vụ phù hợp.")}
              </p>
              <p className="type-supporting mt-2 text-[#6f6558]">
                {archiveView
                  ? "Những nhiệm vụ được lưu trữ sẽ xuất hiện ở đây và có thể khôi phục khi cần."
                  : canEdit
                    ? "Thử xóa bộ lọc hoặc tạo một nhiệm vụ mới."
                    : "Thử xóa bộ lọc để xem toàn bộ nhiệm vụ."}
              </p>
              {archiveView ? (
                <button
                  type="button"
                  onClick={showActiveMissions}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 font-black"
                >
                  <ListChecks size={17} /> Xem nhiệm vụ đang quản lý
                </button>
              ) : null}
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
            <nav aria-label="Phân trang nhiệm vụ" className="flex items-center justify-center gap-3 pt-1">
              <button
                type="button"
                disabled={filters.page <= 1 || query.isFetching}
                onClick={() => changePage(filters.page - 1)}
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
  const archived = item.status === "archived";
  return (
    <tr
      className={cn("border-t align-middle hover:bg-[#fffdf8]", archived && "bg-stone-50 hover:bg-stone-100")}
    >
      <td className="p-3">
        <MissionEditTarget
          canEdit={canEdit && !archived}
          href={`/admin/missions/${item.id}/edit`}
          className="flex min-w-64 items-center gap-3"
        >
          <span className="relative block h-13 w-17 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={item.coverUrl}
              fill
              sizes="68px"
              alt=""
              className={cn("object-cover", archived && "opacity-75 grayscale-[35%]")}
            />
          </span>
          <span>
            <strong className="block">{item.title}</strong>
            <span className="type-caption block text-[#806d54]">Mã nội bộ: {item.slug}</span>
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
      <td className="p-3 whitespace-nowrap text-[#806d54]">{formatMissionTimeline(item)}</td>
      {canEdit ? (
        <td className="p-3">
          <MissionListActions missionId={item.id} status={item.status} showLabels />
        </td>
      ) : null}
    </tr>
  );
}
