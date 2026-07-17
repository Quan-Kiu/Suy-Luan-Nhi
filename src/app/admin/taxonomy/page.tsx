import { asc } from "drizzle-orm";
import { Tags } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { db } from "@/db/client";
import { ageGroups, skills } from "@/db/schema";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { TaxonomyManager } from "@/features/admin/taxonomy-manager";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  const [ages, skillRows] = await Promise.all([
    db.select().from(ageGroups).orderBy(asc(ageGroups.sortOrder)),
    db.select().from(skills).orderBy(asc(skills.title)),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phân loại nội dung"
        title="Độ tuổi & kỹ năng"
        description="Quản lý các nhóm tuổi và tên kỹ năng dùng khi tạo nhiệm vụ, xem báo cáo và gửi gợi ý cho phụ huynh."
        icon={Tags}
      />
      <TaxonomyManager ages={ages} skills={skillRows} />
    </div>
  );
}
