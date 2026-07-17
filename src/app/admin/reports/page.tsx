import { BarChart3 } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { analyticsEventLabels, friendlyLabel, sessionStatusLabels } from "@/features/admin/admin-labels";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getAdminReports } from "@/modules/admin/operations";

export default async function Page() {
  const data = await getAdminReports();
  const accuracy = data.attempts.total ? Math.round((data.attempts.correct / data.attempts.total) * 100) : 0;
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="30 ngày gần nhất"
        title="Báo cáo hoạt động"
        description="Theo dõi cách nội dung được sử dụng mà không có quảng cáo, theo dõi bên thứ ba hoặc so sánh trẻ với nhau."
        icon={BarChart3}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <p className="text-3xl font-black">{data.attempts.total}</p>
          <p className="text-sm font-bold">Lượt trả lời</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{accuracy}%</p>
          <p className="text-sm font-bold">Lượt trả lời đúng</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{Math.round(data.attempts.averageMs / 1000)} giây</p>
          <p className="text-sm font-bold">Thời gian trả lời trung bình</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{data.averageReviewHours.toFixed(1)} giờ</p>
          <p className="text-sm font-bold">Thời gian kiểm duyệt trung bình</p>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black">Trạng thái các phiên chơi</h2>
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
          <h2 className="text-xl font-black">Nhiệm vụ được chơi nhiều</h2>
          <div className="mt-4 space-y-3">
            {data.topMissions.map((item, index) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#fff0df] font-black">
                  {index + 1}
                </span>
                <strong className="flex-1">{item.title}</strong>
                <Pill>{item.count} phiên</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-xl font-black">Các hoạt động được ghi nhận</h2>
          <p className="mt-1 text-sm text-[#6f6558]">
            Tổng hợp hành động trong sản phẩm, không chứa nội dung trả lời hoặc dữ liệu nhạy cảm của trẻ.
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
