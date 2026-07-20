import { Languages } from "lucide-react";
import type { ContentEntryListFilters } from "@/api/content";
import { requireRoles } from "@/auth/session";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { ContentManager } from "@/features/admin/content-manager";
import { contentValueTypes } from "@/domain/content-classification";
import { listContentEntries } from "@/modules/content/content";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([
    requireRoles(["content_admin", "reviewer", "super_admin"]),
    searchParams,
  ]);
  const readParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const rawValueType = readParam("valueType");
  const initialFilters: ContentEntryListFilters = {
    locale: "vi",
    namespace: readParam("namespace")?.trim() || undefined,
    category: readParam("category")?.trim() || undefined,
    valueType: contentValueTypes.includes(rawValueType as (typeof contentValueTypes)[number])
      ? (rawValueType as (typeof contentValueTypes)[number])
      : undefined,
    search: readParam("search")?.trim() || undefined,
    page: Number(readParam("page") || 1),
    pageSize: Number(readParam("pageSize") || 12),
  };
  const initialData = await listContentEntries(initialFilters);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Câu chữ người dùng nhìn thấy"
        title="Chỉnh sửa câu chữ hiển thị"
        description="Chọn khu vực, tìm đúng câu chữ và chỉnh sửa bằng ngôn ngữ gần gũi. Thông tin kỹ thuật được ẩn đi để bạn tập trung vào nội dung."
        icon={Languages}
      />
      <ContentManager
        initialData={initialData}
        initialFilters={initialFilters}
        canEdit={session.user.role === "content_admin" || session.user.role === "super_admin"}
      />
    </div>
  );
}
