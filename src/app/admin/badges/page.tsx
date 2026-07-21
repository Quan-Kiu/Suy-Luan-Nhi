import { Award } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { db } from "@/db/client";
import { skills } from "@/db/schema";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { BadgeManager } from "@/features/admin/badge-manager";
import { listBadges } from "@/modules/admin/badge-admin";
import { asc } from "drizzle-orm";

export default async function Page() {
  await requireRoles(["content_admin", "super_admin"]);
  const [items, skillRows] = await Promise.all([
    listBadges(),
    db.select({ id: skills.id, title: skills.title }).from(skills).orderBy(asc(skills.title)),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Phần thưởng sau nhiệm vụ"
        title="Huy hiệu"
        description="Tạo và cập nhật huy hiệu, xem nhiệm vụ nào đang sử dụng và giữ nguyên lịch sử phần thưởng của bé."
        icon={Award}
      />
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Huy hiệu được trao khi bé hoàn thành nhiệm vụ có gắn phần thưởng đó. Hãy duyệt ảnh huy hiệu trong thư
        viện trước khi gửi nhiệm vụ đi kiểm tra.
      </div>
      <BadgeManager items={items} skills={skillRows} />
    </div>
  );
}
