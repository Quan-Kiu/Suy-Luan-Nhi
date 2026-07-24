import type { Metadata } from "next";
import { Database, Filter, X } from "lucide-react";
import Link from "next/link";
import { requireStaff } from "@/auth/session";
import { auditActionLabels, friendlyLabel, resourceTypeLabels } from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { listAuditLogs } from "@/modules/admin/operations";

export const metadata: Metadata = {
  title: "Các thay đổi gần đây",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ resourceType?: string; action?: string }>;
}) {
  await requireStaff();
  const filters = await searchParams;
  const items = await listAuditLogs(filters);
  const hasFilters = Boolean(filters.resourceType || filters.action);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ai đã làm gì"
        title="Các thay đổi gần đây"
        description="Xem nội dung nào đã được sửa, sửa lúc nào và do ai thực hiện. Thông tin kỹ thuật chỉ hiện khi bạn chủ động mở."
        icon={Database}
      />
      <form className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_1fr_auto_auto]">
        <label>
          <span className="type-caption mb-1 block font-black text-[#6f6558]">Loại nội dung</span>
          <select
            name="resourceType"
            defaultValue={filters.resourceType ?? ""}
            className="min-h-11 w-full rounded-xl border px-3"
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
          <input
            name="action"
            defaultValue={filters.action}
            placeholder="Ví dụ: tạo, sửa, cho bé xem"
            className="min-h-11 w-full rounded-xl border px-3"
          />
        </label>
        <button className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-4 font-black text-white">
          <Filter size={17} /> Áp dụng
        </button>
        {hasFilters ? (
          <Link
            href="/admin/audit"
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
          >
            <X size={17} /> Xóa lọc
          </Link>
        ) : null}
      </form>

      <p className="type-supporting font-bold text-[#6f6558]">{items.length} thay đổi gần nhất</p>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">{friendlyLabel(auditActionLabels, item.action)}</p>
                <p className="type-supporting mt-1 text-[#6f6558]">
                  {friendlyLabel(resourceTypeLabels, item.resourceType)} ·{" "}
                  {item.createdAt.toLocaleString("vi-VN")}
                </p>
              </div>
              <span className="type-caption rounded-full bg-[#f5f2ec] px-3 py-1 font-black">
                {item.actorId ? "Tài khoản quản trị" : "Hệ thống tự động"}
              </span>
            </div>
            <details className="type-caption mt-3 rounded-xl bg-[#f7f3eb] p-3">
              <summary className="cursor-pointer font-black">Thông tin kỹ thuật</summary>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <dt className="font-bold">Mã nội dung</dt>
                  <dd className="font-mono break-all">{item.resourceId ?? "Không có"}</dd>
                </div>
                <div>
                  <dt className="font-bold">Mã người thực hiện</dt>
                  <dd className="font-mono break-all">{item.actorId ?? "system"}</dd>
                </div>
              </dl>
              {Object.keys(item.metadata).length ? (
                <details className="mt-3 rounded-lg bg-white p-3">
                  <summary className="cursor-pointer font-bold">Xem dữ liệu chi tiết</summary>
                  <pre className="mt-3 overflow-x-auto font-mono whitespace-pre-wrap">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </details>
              ) : null}
            </details>
          </article>
        ))}
      </div>
      {!items.length ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-[#6f6558]">
          Không có thay đổi phù hợp với bộ lọc.
        </div>
      ) : null}
    </div>
  );
}
