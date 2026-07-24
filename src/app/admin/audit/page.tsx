import type { Metadata } from "next";
import {
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  Search,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { requireStaff } from "@/auth/session";
import { auditActionLabels, friendlyLabel, resourceTypeLabels } from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { listAuditLogs } from "@/modules/admin/operations";

export const metadata: Metadata = {
  title: "Các thay đổi gần đây",
};

const defaultPageSize = 25;
const pageSizeOptions = [10, 25, 50, 100] as const;

type AuditSearchParams = {
  resourceType?: string;
  action?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
};

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseDateBoundary(value: string | undefined, endExclusive = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endExclusive) date.setDate(date.getDate() + 1);
  return date;
}

function auditHref(filters: AuditSearchParams, page: number) {
  const params = new URLSearchParams();
  if (filters.resourceType) params.set("resourceType", filters.resourceType);
  if (filters.action) params.set("action", filters.action);
  if (filters.resourceId) params.set("resourceId", filters.resourceId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  if (filters.pageSize && filters.pageSize !== String(defaultPageSize)) {
    params.set("pageSize", filters.pageSize);
  }
  const query = params.toString();
  return query ? `/admin/audit?${query}` : "/admin/audit";
}

function paginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = [...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
  const items: Array<number | string> = [];
  for (const page of pages) {
    const previous = items.at(-1);
    if (typeof previous === "number" && page - previous > 1) items.push(`ellipsis-${previous}`);
    items.push(page);
  }
  return items;
}

function formatDay(value: Date) {
  const formatted = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(value);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(value);
}

function resourceDisplayName(...states: unknown[]) {
  for (const state of states) {
    if (!state || typeof state !== "object" || Array.isArray(state)) continue;
    const record = state as Record<string, unknown>;
    for (const key of ["title", "name", "displayName", "label"] as const) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return null;
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  if (value === null || value === undefined) return null;
  return (
    <section className="min-w-0 rounded-xl border bg-white p-3">
      <h4 className="type-caption font-black text-[#6f6558]">{title}</h4>
      <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-[#2f2a24] p-3 font-mono text-xs leading-5 whitespace-pre-wrap text-white">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<AuditSearchParams> }) {
  await requireStaff();
  const filters = await searchParams;
  const requestedPageSize = parsePositiveInteger(filters.pageSize, defaultPageSize);
  const pageSize = pageSizeOptions.includes(requestedPageSize as (typeof pageSizeOptions)[number])
    ? requestedPageSize
    : defaultPageSize;
  const data = await listAuditLogs({
    resourceType: filters.resourceType,
    action: filters.action,
    resourceId: filters.resourceId?.trim() || undefined,
    from: parseDateBoundary(filters.from),
    to: parseDateBoundary(filters.to, true),
    page: parsePositiveInteger(filters.page, 1),
    pageSize,
  });
  const normalizedFilters = { ...filters, pageSize: String(data.pageSize) };
  const hasFilters = Boolean(
    filters.resourceType || filters.action || filters.resourceId || filters.from || filters.to,
  );
  const firstItem = data.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastItem = Math.min(data.page * data.pageSize, data.total);
  const groups = data.items.reduce<Array<{ day: string; items: typeof data.items }>>((result, item) => {
    const day = formatDay(item.createdAt);
    const current = result.at(-1);
    if (current?.day === day) current.items.push(item);
    else result.push({ day, items: [item] });
    return result;
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ai đã làm gì"
        title="Các thay đổi gần đây"
        description="Theo dõi thay đổi theo thời gian, nội dung và hành động. Mỗi dòng cho biết điều gì đã xảy ra, ai thực hiện và dữ liệu trước–sau khi cần đối chiếu."
        icon={Database}
      />

      <form className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(170px,1fr)_minmax(210px,1.2fr)_minmax(200px,1fr)_155px_155px_120px]">
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Loại nội dung</span>
            <select
              name="resourceType"
              defaultValue={filters.resourceType ?? ""}
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            >
              <option value="">Tất cả loại nội dung</option>
              {Object.entries(resourceTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Hành động</span>
            <select
              name="action"
              defaultValue={filters.action ?? ""}
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            >
              <option value="">Tất cả hành động</option>
              {Object.entries(auditActionLabels)
                .sort(([, left], [, right]) => left.localeCompare(right, "vi"))
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Mã nội dung</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-3 left-3 text-[#887b6c]" size={18} />
              <input
                name="resourceId"
                defaultValue={filters.resourceId}
                placeholder="Tìm toàn bộ hoặc một phần mã"
                className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
              />
            </span>
          </label>
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Từ ngày</span>
            <input
              type="date"
              name="from"
              defaultValue={filters.from}
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            />
          </label>
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Đến ngày</span>
            <input
              type="date"
              name="to"
              defaultValue={filters.to}
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            />
          </label>
          <label>
            <span className="type-caption mb-1 block font-black text-[#6f6558]">Mỗi trang</span>
            <select
              name="pageSize"
              defaultValue={String(data.pageSize)}
              className="min-h-11 w-full rounded-xl border bg-white px-3"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} dòng
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="type-caption flex items-center gap-2 text-[#6f6558]">
            <CalendarDays size={16} /> Khoảng ngày được tính theo múi giờ Việt Nam.
          </p>
          <div className="flex flex-wrap gap-2">
            {hasFilters ? (
              <Link
                href="/admin/audit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
              >
                <X size={17} /> Xóa lọc
              </Link>
            ) : null}
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-5 font-black text-white">
              <Filter size={17} /> Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </form>

      <section aria-label="Danh sách thay đổi" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="type-supporting font-black text-[#3f392f]">
              Hiển thị {firstItem}–{lastItem} trong {data.total} thay đổi
            </p>
            <p className="type-caption mt-1 text-[#6f6558]">
              Sắp xếp mới nhất trước · Trang {data.page}/{data.totalPages}
            </p>
          </div>
          {hasFilters ? (
            <span className="type-caption rounded-full bg-[#f2e5d2] px-3 py-1.5 font-black text-[#8d3c12]">
              Đang dùng bộ lọc
            </span>
          ) : null}
        </div>

        {groups.map((group) => (
          <section key={group.day} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <header className="border-b bg-[#f7f3eb] px-4 py-3">
              <h2 className="type-card-title text-[#4d4438]">{group.day}</h2>
            </header>
            <div className="divide-y">
              {group.items.map((item) => {
                const actorLabel = item.actorId
                  ? item.actorName || item.actorEmail || "Tài khoản quản trị"
                  : "Hệ thống tự động";
                const metadata = item.metadata ?? {};
                const resourceName = resourceDisplayName(item.afterState, item.beforeState);
                const hasDetails = Boolean(
                  item.resourceId ||
                  item.actorId ||
                  item.beforeState != null ||
                  item.afterState != null ||
                  Object.keys(metadata).length,
                );
                return (
                  <article
                    key={item.id}
                    className="grid gap-3 p-4 lg:grid-cols-[92px_minmax(0,1fr)_minmax(190px,240px)] lg:items-start"
                  >
                    <time
                      dateTime={item.createdAt.toISOString()}
                      className="type-label rounded-lg bg-[#f7f3eb] px-2.5 py-2 text-center font-black text-[#6f6558]"
                    >
                      {formatTime(item.createdAt)}
                    </time>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-caption rounded-full bg-[#f2e5d2] px-2.5 py-1 font-black text-[#8d3c12]">
                          {friendlyLabel(resourceTypeLabels, item.resourceType)}
                        </span>
                      </div>
                      <h3 className="type-card-title mt-2">
                        {friendlyLabel(auditActionLabels, item.action)}
                      </h3>
                      <p className="type-supporting mt-1 text-[#6f6558]">
                        {resourceName
                          ? `Nội dung: ${resourceName}`
                          : item.resourceId
                            ? `Mã nội dung: ${item.resourceId}`
                            : "Không gắn với một nội dung cụ thể"}
                      </p>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-[#fbfaf7] p-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white shadow-sm">
                        {item.actorId ? <UserRound size={18} /> : <Bot size={18} />}
                      </span>
                      <div className="min-w-0">
                        <p className="type-caption font-bold text-[#887b6c]">Người thực hiện</p>
                        <p className="type-label truncate font-black" title={actorLabel}>
                          {actorLabel}
                        </p>
                        {item.actorId && item.actorEmail && item.actorEmail !== actorLabel ? (
                          <p className="type-caption truncate text-[#6f6558]" title={item.actorEmail}>
                            {item.actorEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {hasDetails ? (
                      <details className="rounded-xl border bg-[#f7f3eb] lg:col-span-2 lg:col-start-2">
                        <summary className="type-label cursor-pointer px-4 py-3 font-black">
                          Xem chi tiết thay đổi
                        </summary>
                        <div className="space-y-3 border-t p-4">
                          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl bg-white p-3">
                              <dt className="type-caption font-bold text-[#6f6558]">Mã hành động</dt>
                              <dd className="mt-1 font-mono text-xs break-all">{item.action}</dd>
                            </div>
                            <div className="rounded-xl bg-white p-3">
                              <dt className="type-caption font-bold text-[#6f6558]">Mã nội dung</dt>
                              <dd className="mt-1 font-mono text-xs break-all">
                                {item.resourceId ?? "Không có"}
                              </dd>
                            </div>
                            <div className="rounded-xl bg-white p-3">
                              <dt className="type-caption font-bold text-[#6f6558]">Mã người thực hiện</dt>
                              <dd className="mt-1 font-mono text-xs break-all">{item.actorId ?? "system"}</dd>
                            </div>
                            <div className="rounded-xl bg-white p-3">
                              <dt className="type-caption font-bold text-[#6f6558]">Mã bản ghi log</dt>
                              <dd className="mt-1 font-mono text-xs break-all">{item.id}</dd>
                            </div>
                          </dl>
                          <div className="grid gap-3 xl:grid-cols-2">
                            <JsonPanel title="Trước thay đổi" value={item.beforeState} />
                            <JsonPanel title="Sau thay đổi" value={item.afterState} />
                          </div>
                          {Object.keys(metadata).length ? (
                            <JsonPanel title="Dữ liệu bổ sung" value={metadata} />
                          ) : null}
                        </div>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {!data.items.length ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <Database className="mx-auto text-[#a49480]" size={32} />
            <h2 className="type-card-title mt-3">Không có thay đổi phù hợp</h2>
            <p className="type-supporting mx-auto mt-1 max-w-xl text-[#6f6558]">
              Thử mở rộng khoảng ngày, chọn lại loại nội dung hoặc xóa mã nội dung đang tìm.
            </p>
            {hasFilters ? (
              <Link
                href="/admin/audit"
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
              >
                <X size={17} /> Xóa toàn bộ bộ lọc
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>

      {data.totalPages > 1 ? (
        <nav
          aria-label="Chuyển trang nhật ký thay đổi"
          className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-white p-3 shadow-sm"
        >
          {data.page > 1 ? (
            <Link
              href={auditHref(normalizedFilters, data.page - 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 font-black"
            >
              <ChevronLeft size={18} /> Trang trước
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 font-black opacity-40">
              <ChevronLeft size={18} /> Trang trước
            </span>
          )}
          <div className="flex flex-wrap items-center justify-center gap-1">
            {paginationItems(data.page, data.totalPages).map((item) =>
              typeof item === "number" ? (
                <Link
                  key={item}
                  href={auditHref(normalizedFilters, item)}
                  aria-current={item === data.page ? "page" : undefined}
                  className="grid size-11 place-items-center rounded-xl border font-black aria-[current=page]:border-[#3f392f] aria-[current=page]:bg-[#3f392f] aria-[current=page]:text-white"
                >
                  {item}
                </Link>
              ) : (
                <span key={item} className="grid size-8 place-items-center text-[#887b6c]">
                  …
                </span>
              ),
            )}
          </div>
          {data.page < data.totalPages ? (
            <Link
              href={auditHref(normalizedFilters, data.page + 1)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 font-black"
            >
              Trang sau <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 font-black opacity-40">
              Trang sau <ChevronRight size={18} />
            </span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
