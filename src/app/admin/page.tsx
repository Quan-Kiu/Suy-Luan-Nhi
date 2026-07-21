import { ArrowRight, BarChart3, ClipboardCheck, FilePlus2, ImageIcon, MonitorDot, Users } from "lucide-react";
import Link from "next/link";
import { requireStaff } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import { contentText } from "@/content/resolve";
import {
  auditActionLabels,
  friendlyLabel,
  missionStatusLabels,
  resourceTypeLabels,
} from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getPrimaryRole } from "@/features/admin/admin-role";
import { getAdminDashboard } from "@/modules/admin/operations";
import { getContentNamespace } from "@/modules/content/content";

export default async function Page() {
  const [data, content, session] = await Promise.all([
    getAdminDashboard(),
    getContentNamespace("admin"),
    requireStaff(),
  ]);
  const t = (key: string, fallback: string) => contentText(content, key, fallback);
  const role = getPrimaryRole(session.user.role);
  const publishedCount = data.missionCounts.published ?? 0;
  const draftCount = data.missionCounts.draft ?? 0;
  const tasks = {
    create: {
      title: t("dashboard.createMission", "Tạo nhiệm vụ mới"),
      description: t("dashboard.createMissionDescription", "Bắt đầu từ mẫu và xem trước ngay khi soạn."),
      href: "/admin/missions/new",
      icon: FilePlus2,
    },
    drafts: {
      title: `${draftCount} ${t("dashboard.draftTasks", "bản nháp đang soạn")}`,
      description: t("dashboard.draftTasksDescription", "Tiếp tục nội dung còn dang dở hoặc cần chỉnh sửa."),
      href: "/admin/missions?status=draft",
      icon: FilePlus2,
    },
    reviews: {
      title: `${data.pendingReviews} ${t("dashboard.reviewTasks", "nhiệm vụ chờ duyệt")}`,
      description: t("dashboard.reviewTasksDescription", "Kiểm tra nội dung trước khi hiển thị cho trẻ."),
      href: "/admin/reviews",
      icon: ClipboardCheck,
    },
    mediaReview: {
      title: `${data.pendingMedia} ${t("dashboard.mediaTasks", "tư liệu cần kiểm tra")}`,
      description: t("dashboard.mediaTasksDescription", "Xác nhận hình ảnh và âm thanh phù hợp."),
      href: "/admin/media",
      icon: ImageIcon,
    },
    mediaLibrary: {
      title: t("dashboard.mediaLibrary", "Quản lý hình ảnh & âm thanh"),
      description: t("dashboard.mediaLibraryDescription", "Tải lên và sắp xếp tư liệu dùng trong nhiệm vụ."),
      href: "/admin/media",
      icon: ImageIcon,
    },
    reports: {
      title: t("dashboard.viewReports", "Xem báo cáo 30 ngày"),
      description: t(
        "dashboard.viewReportsDescription",
        "Theo dõi lượt chơi, độ chính xác và nội dung nổi bật.",
      ),
      href: "/admin/reports",
      icon: BarChart3,
    },
  };
  const urgentTasks =
    role === "reviewer"
      ? [tasks.reviews, tasks.mediaReview, tasks.reports]
      : role === "content_admin"
        ? [tasks.create, tasks.drafts, tasks.mediaLibrary]
        : [tasks.create, tasks.reviews, tasks.mediaReview];

  const metrics = [
    { label: "Nhiệm vụ đang hiển thị", value: publishedCount, icon: ClipboardCheck },
    { label: "Bản nháp đang soạn", value: draftCount, icon: FilePlus2 },
    { label: "Lượt chơi trong 30 ngày", value: data.sessions30d, icon: MonitorDot },
    { label: "Hồ sơ bé đang hoạt động", value: data.children, icon: Users },
  ];
  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow={t("dashboard.eyebrow", "Trung tâm công việc")}
        title={t("dashboard.title", "Hôm nay cần làm gì?")}
        description={t(
          "dashboard.description",
          "Bắt đầu từ các việc quan trọng, theo dõi nội dung đang soạn và kiểm tra những thay đổi gần đây.",
        )}
      />

      <section aria-labelledby="admin-priority-title">
        <h2 id="admin-priority-title" className="text-xl font-black">
          {t("dashboard.priorityTitle", "Việc ưu tiên")}
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {urgentTasks.map(({ title, description, href, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="flex h-full items-start gap-4 p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#bd4910]">
                  <Icon size={21} />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-lg">{title}</strong>
                  <span className="mt-1 block text-sm leading-6 text-[#6f6558]">{description}</span>
                </span>
                <ArrowRight size={18} className="mt-1 shrink-0 transition group-hover:translate-x-1" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="admin-summary-title">
        <h2 id="admin-summary-title" className="text-xl font-black">
          {t("dashboard.summaryTitle", "Tình hình chung")}
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-4">
              <Icon size={20} className="text-[#e9641a]" />
              <p className="mt-3 text-3xl font-black">{value}</p>
              <p className="mt-1 text-sm font-bold text-[#6f6558]">{label}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">{t("dashboard.contentStatus", "Tiến độ nội dung")}</h2>
              <p className="mt-1 text-sm text-[#6f6558]">
                Xem mỗi nhiệm vụ đang được soạn, chờ kiểm tra hay đã hiển thị cho bé.
              </p>
            </div>
            <Link
              href="/admin/missions"
              className="inline-flex items-center gap-1 text-sm font-black text-[#bd4910]"
            >
              {t("dashboard.openCms", "Xem tất cả nhiệm vụ")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(data.missionCounts).map(([status, count]) => (
              <Link
                key={status}
                href={`/admin/missions?status=${status}`}
                className="rounded-2xl border bg-[#fbf8f2] p-4 transition hover:border-[#e5b98f]"
              >
                <p className="text-2xl font-black">{count}</p>
                <p className="mt-1 text-sm font-bold">{friendlyLabel(missionStatusLabels, status)}</p>
              </Link>
            ))}
          </div>
          {!Object.keys(data.missionCounts).length ? (
            <p className="mt-4 text-sm text-[#6f6558]">
              {t("dashboard.emptyMissions", "Chưa có nhiệm vụ nào.")}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">{t("dashboard.recentAudit", "Thay đổi gần đây")}</h2>
              <p className="mt-1 text-sm text-[#6f6558]">
                Những thay đổi mới nhất do người quản trị hoặc hệ thống thực hiện.
              </p>
            </div>
            <Pill>{Math.min(data.recentAudit.length, 5)} thay đổi</Pill>
          </div>
          <div className="mt-4 space-y-3">
            {data.recentAudit.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm">{friendlyLabel(auditActionLabels, item.action)}</strong>
                  <Pill>{friendlyLabel(resourceTypeLabels, item.resourceType)}</Pill>
                </div>
                <p className="mt-1 text-xs text-[#806d54]">{item.createdAt.toLocaleString("vi-VN")}</p>
              </div>
            ))}
            {!data.recentAudit.length ? (
              <p className="rounded-xl bg-[#f7f3eb] p-4 text-sm text-[#6f6558]">
                Chưa có thay đổi nào được ghi nhận.
              </p>
            ) : null}
          </div>
          <Link
            href="/admin/audit"
            className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#bd4910]"
          >
            {t("dashboard.viewAudit", "Xem nhật ký thay đổi")}
            <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
