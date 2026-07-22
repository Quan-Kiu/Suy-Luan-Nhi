import { BarChart3 } from "lucide-react";
import { requireStaff } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import { analyticsEventLabels, friendlyLabel, sessionStatusLabels } from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getAdminReports } from "@/modules/admin/operations";

export default async function Page() {
  await requireStaff();
  const data = await getAdminReports();
  const accuracy = data.attempts.total ? Math.round((data.attempts.correct / data.attempts.total) * 100) : 0;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="30 ngày gần nhất"
        title="Báo cáo sử dụng"
        description="Xem nội dung được sử dụng ra sao. Báo cáo không có quảng cáo, không theo dõi bên thứ ba và không so sánh trẻ với nhau."
        icon={BarChart3}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="type-metric-value">{data.attempts.total}</p>
          <p className="type-supporting font-bold">Số câu bé đã trả lời</p>
        </Card>
        <Card className="p-4">
          <p className="type-metric-value">{accuracy}%</p>
          <p className="type-supporting font-bold">Tỷ lệ trả lời đúng</p>
        </Card>
        <Card className="p-4">
          <p className="type-metric-value">{Math.round(data.attempts.averageMs / 1000)} giây</p>
          <p className="type-supporting font-bold">Thời gian trung bình cho mỗi câu</p>
        </Card>
        <Card className="p-4">
          <p className="type-metric-value">{data.averageReviewHours.toFixed(1)} giờ</p>
          <p className="type-supporting font-bold">Thời gian trung bình để kiểm tra nội dung</p>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="type-section-title">Các lượt chơi đang ở bước nào</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(data.sessionsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-xl bg-[#f7f3eb] p-3">
                <strong>{friendlyLabel(sessionStatusLabels, status)}</strong>
                <Pill>{count}</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="type-section-title">Nhiệm vụ được chơi nhiều</h2>
          <div className="mt-4 space-y-3">
            {data.topMissions.map((item, index) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#fff0df] font-black">
                  {index + 1}
                </span>
                <strong className="flex-1">{item.title}</strong>
                <Pill>{item.count} lượt</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="type-section-title">Các tính năng được sử dụng</h2>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Chỉ tổng hợp số lần các tính năng được dùng; không lưu câu trả lời hoặc thông tin riêng của bé
            trong báo cáo này.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.events.map((item) => (
              <Pill key={item.eventName}>
                {friendlyLabel(analyticsEventLabels, item.eventName)} · {item.count}
              </Pill>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
