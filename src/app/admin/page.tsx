import Link from "next/link";
import { ClipboardCheck, FileText, ImageIcon, MonitorDot, Users } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { contentText } from "@/content/resolve";
import { getAdminDashboard } from "@/modules/admin/operations";
import { getContentNamespace } from "@/modules/content/content";

export default async function Page() {
  const [data, content] = await Promise.all([getAdminDashboard(), getContentNamespace("admin")]);
  const t = (key: string, fallback: string) => contentText(content, key, fallback);
  const cards = [
    { label: t("dashboard.accounts", "Tài khoản"), value: data.users, icon: Users, href: "/admin/members" },
    { label: t("dashboard.children", "Hồ sơ bé"), value: data.children, icon: Users, href: "/admin/reports" },
    {
      label: t("dashboard.sessions30d", "Phiên chơi 30 ngày"),
      value: data.sessions30d,
      icon: MonitorDot,
      href: "/admin/reports",
    },
    {
      label: t("dashboard.pendingReviews", "Chờ duyệt"),
      value: data.pendingReviews,
      icon: ClipboardCheck,
      href: "/admin/reviews",
    },
    {
      label: t("dashboard.pendingMedia", "Media chờ duyệt"),
      value: data.pendingMedia,
      icon: ImageIcon,
      href: "/admin/media",
    },
  ];
  return (
    <div>
      <div>
        <p className="text-sm text-[#806d54]">{t("dashboard.eyebrow", "Operational overview")}</p>
        <h1 className="text-3xl font-black">{t("dashboard.title", "Tổng quan hệ thống")}</h1>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="h-full p-4 transition hover:-translate-y-1">
              <Icon className="text-[#e9641a]" />
              <p className="mt-3 text-3xl font-black">{value}</p>
              <p className="text-xs font-bold text-[#806d54]">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.75fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">{t("dashboard.contentStatus", "Trạng thái nội dung")}</h2>
            <Link href="/admin/missions" className="text-sm font-bold underline">
              {t("dashboard.openCms", "Mở CMS")}
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Object.entries(data.missionCounts).map(([status, count]) => (
              <div key={status} className="rounded-xl bg-[#f7f3eb] p-3 text-center">
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs font-bold">{status}</p>
              </div>
            ))}
          </div>
          {!Object.keys(data.missionCounts).length ? (
            <p className="mt-4 text-sm">{t("dashboard.emptyMissions", "Chưa có dữ liệu nhiệm vụ.")}</p>
          ) : null}
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <FileText size={20} />
            <h2 className="text-xl font-black">{t("dashboard.recentAudit", "Audit gần đây")}</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentAudit.map((item) => (
              <div key={item.id} className="rounded-xl border p-3">
                <div className="flex justify-between gap-2">
                  <strong className="text-sm">{item.action}</strong>
                  <Pill>{item.resourceType}</Pill>
                </div>
                <p className="mt-1 text-xs text-[#806d54]">{item.createdAt.toLocaleString("vi-VN")}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/audit" className="mt-4 inline-block text-sm font-bold underline">
            {t("dashboard.viewAudit", "Xem toàn bộ audit log")}
          </Link>
        </Card>
      </div>
    </div>
  );
}
