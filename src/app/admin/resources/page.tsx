import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { hasRole } from "@/auth/roles";
import { requireStaff } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ResourceListWorkspace } from "@/features/admin/resource-list-workspace";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";
import {
  parentResourceCategories,
  parentResourceTypes,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { listAdminResources } from "@/modules/admin/resource-admin";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([requireStaff(), searchParams]);
  const canEdit = hasRole(session.user.role, ["content_admin", "super_admin"]);
  const readParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const rawStatus = readParam("status");
  const rawType = readParam("resourceType");
  const rawCategory = readParam("category");
  const rawAgeGroup = readParam("ageGroup");
  const filters = {
    search: readParam("search")?.trim() || undefined,
    status: (["draft", "published", "archived"] as const).includes(rawStatus as never)
      ? (rawStatus as "draft" | "published" | "archived")
      : undefined,
    resourceType: parentResourceTypes.includes(rawType as ParentResourceType)
      ? (rawType as ParentResourceType)
      : undefined,
    category: parentResourceCategories.includes(rawCategory as ParentResourceCategory)
      ? (rawCategory as ParentResourceCategory)
      : undefined,
    ageGroup: ageGroupCodes.includes(rawAgeGroup as AgeGroup) ? (rawAgeGroup as AgeGroup) : undefined,
    page: Number(readParam("page") || 1),
    pageSize: Number(readParam("pageSize") || 10),
  };
  const initialData = await listAdminResources(filters);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Đồng hành cùng gia đình"
        title="Gợi ý cho phụ huynh"
        description="Soạn, phân loại và xuất bản bài viết, hướng dẫn hoặc hoạt động giúp phụ huynh đồng hành cùng trẻ 6–12 tuổi."
        icon={BookOpen}
        actions={
          canEdit ? (
            <Link
              href="/admin/resources/new"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#b9470d] px-4 font-black text-white shadow-[0_4px_0_#7f2e05]"
            >
              <Plus size={18} /> Viết nội dung mới
            </Link>
          ) : null
        }
      />
      <ResourceListWorkspace initialData={initialData} initialFilters={filters} canEdit={canEdit} />
    </div>
  );
}
