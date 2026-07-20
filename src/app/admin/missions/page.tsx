import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import type { AdminMissionPage } from "@/api/admin/missions";
import { hasRole } from "@/auth/roles";
import { requireStaff } from "@/auth/session";
import { contentText } from "@/content/resolve";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { MissionListWorkspace } from "@/features/admin/mission-list-workspace";
import { getAdminTaxonomy, listAdminMissions } from "@/modules/admin/mission-admin";
import { getContentNamespace } from "@/modules/content/content";

type SearchParams = {
  status?: string;
  worldId?: string;
  search?: string;
  page?: string;
  pageSize?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [rawFilters, session] = await Promise.all([searchParams, requireStaff()]);
  const canEdit = hasRole(session.user.role, ["content_admin", "super_admin"]);
  const initialFilters = {
    status: rawFilters.status || undefined,
    worldId: rawFilters.worldId || undefined,
    search: rawFilters.search?.trim() || undefined,
    page: Math.max(1, Number(rawFilters.page) || 1),
    pageSize: Math.min(30, Math.max(5, Number(rawFilters.pageSize) || 10)),
  };
  const [result, taxonomy, content] = await Promise.all([
    listAdminMissions(initialFilters),
    getAdminTaxonomy(),
    getContentNamespace("admin"),
  ]);
  const initialData: AdminMissionPage = {
    ...result,
    items: result.items.map((item) => ({
      ...item,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      scheduledFor: item.scheduledFor?.toISOString() ?? null,
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
  const t = (key: string, fallback: string) => contentText(content, key, fallback);

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
      <MissionListWorkspace
        initialData={initialData}
        initialFilters={initialFilters}
        worlds={taxonomy.worlds.map((world) => ({ id: world.id, title: world.title }))}
        canEdit={canEdit}
        content={content}
      />
    </div>
  );
}
