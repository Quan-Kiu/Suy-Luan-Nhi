import { FileText, Filter, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { hasRole } from "@/auth/roles";
import { requireStaff } from "@/auth/session";
import { contentTemplate, contentText } from "@/content/resolve";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MissionListActions } from "@/features/admin/mission-list-actions";
import { MissionStatusBadge } from "@/features/admin/mission-status-badge";
import { missionStatusLabels } from "@/features/admin/admin-labels";
import { getAdminTaxonomy, listAdminMissions } from "@/modules/admin/mission-admin";
import { getContentNamespace } from "@/modules/content/content";

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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; worldId?: string; search?: string }>;
}) {
  const [filters, session] = await Promise.all([searchParams, requireStaff()]);
  const canEdit = hasRole(session.user.role, ["content_admin", "super_admin"]);
  const [items, taxonomy, content] = await Promise.all([
    listAdminMissions(filters),
    getAdminTaxonomy(),
    getContentNamespace("admin"),
  ]);
  const t = (key: string, fallback: string) => contentText(content, key, fallback);
  const hasFilters = Boolean(filters.status || filters.worldId || filters.search);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={t("missions.eyebrow", "Kho nội dung")}
        title={t("missions.title", "Quản lý nhiệm vụ")}
        description={
          canEdit
            ? t(
                "missions.description",
                "Tạo, chỉnh sửa và theo dõi từng nhiệm vụ từ bản nháp đến khi hiển thị cho trẻ.",
              )
            : t(
                "missions.readOnlyDescription",
                "Xem toàn bộ nhiệm vụ và trạng thái hiện tại; nội dung chờ duyệt nằm trong mục Duyệt nội dung.",
              )
        }
        icon={FileText}
        actions={
          canEdit ? (
            <Link
              href="/admin/missions/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b9470d] px-4 font-black text-white shadow-[0_4px_0_#7f2e05]"
            >
              <Plus size={18} /> {t("missions.create", "Tạo nhiệm vụ mới")}
            </Link>
          ) : null
        }
      />

      <form className="grid gap-3 rounded-2xl border bg-white p-4 lg:grid-cols-[minmax(260px,1fr)_220px_210px_auto_auto]">
        <label className="relative">
          <span className="sr-only">Tìm nhiệm vụ</span>
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder={t("missions.search", "Tìm theo tên nhiệm vụ")}
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <label>
          <span className="sr-only">Lọc theo thế giới nhiệm vụ</span>
          <select
            name="worldId"
            defaultValue={filters.worldId ?? ""}
            className="min-h-11 w-full rounded-xl border px-3"
          >
            <option value="">{t("missions.allWorlds", "Mọi thế giới")}</option>
            {taxonomy.worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái</span>
          <select
            name="status"
            defaultValue={filters.status ?? ""}
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
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#3f392f] px-4 font-black text-white">
          <Filter size={17} />
          {t("missions.filter", "Áp dụng")}
        </button>
        {hasFilters ? (
          <Link
            href="/admin/missions"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 font-black"
          >
            <X size={17} /> Xóa lọc
          </Link>
        ) : null}
      </form>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#6f6558]">
          {contentTemplate(content, "missions.resultCount", "{count} nhiệm vụ", { count: items.length })}
        </p>
      </div>

      <div className="grid gap-4 md:hidden">
        {items.map((item, index) => (
          <article key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <MissionEditTarget canEdit={canEdit} href={`/admin/missions/${item.id}/edit`} className="block">
              <div className="relative h-36 w-full overflow-hidden">
                <Image
                  src={item.coverUrl}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 2rem), 1px"
                  preload={index === 0}
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
                <p className="mt-1 text-xs text-[#756b60]">
                  Cập nhật {item.updatedAt.toLocaleDateString("vi-VN")}
                </p>
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
            {items.map((item) => (
              <tr key={item.id} className="border-t align-middle hover:bg-[#fffdf8]">
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
                <td className="p-3 text-[#806d54]">{item.updatedAt.toLocaleDateString("vi-VN")}</td>
                {canEdit ? (
                  <td className="p-3">
                    <MissionListActions missionId={item.id} showLabels />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!items.length ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <p className="font-black">{t("missions.empty", "Không tìm thấy nhiệm vụ phù hợp.")}</p>
          <p className="mt-2 text-sm text-[#6f6558]">
            {canEdit
              ? "Thử xóa bộ lọc hoặc tạo một nhiệm vụ mới."
              : "Thử xóa bộ lọc để xem toàn bộ nhiệm vụ."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
