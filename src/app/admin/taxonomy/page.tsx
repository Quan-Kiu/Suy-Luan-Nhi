import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Tags } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { db } from "@/db/client";
import { ageGroups, skills } from "@/db/schema";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { TaxonomyManager } from "@/features/admin/taxonomy-manager";

export const metadata: Metadata = {
  title: "Nhóm tuổi và kỹ năng",
};

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  const [ages, skillRows] = await Promise.all([
    db.select().from(ageGroups).orderBy(asc(ageGroups.sortOrder)),
    db.select().from(skills).orderBy(asc(skills.title)),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Nội dung dùng khi soạn nhiệm vụ"
        title="Nhóm tuổi và kỹ năng"
        description="Đặt tên và mô tả các nhóm tuổi, kỹ năng suy luận và thói quen tích cực theo cách người soạn và phụ huynh dễ hiểu."
        icon={Tags}
      />
      <TaxonomyManager ages={ages} skills={skillRows} />
    </div>
  );
}
