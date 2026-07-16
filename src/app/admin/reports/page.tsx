import { Card, Pill } from "@/components/ui";
import { getAdminReports } from "@/modules/admin/operations";
export default async function Page() {
  const data = await getAdminReports();
  const accuracy = data.attempts.total ? Math.round((data.attempts.correct / data.attempts.total) * 100) : 0;
  return (
    <div>
      <h1 className="text-3xl font-black">Báo cáo vận hành</h1>
      <p className="mt-2 text-[#806d54]">
        Số liệu first-party tối giản trong 30 ngày, không có tracking quảng cáo hoặc dữ liệu định danh của bé.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-3xl font-black">{data.attempts.total}</p>
          <p className="text-xs font-bold">Lượt trả lời</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{accuracy}%</p>
          <p className="text-xs font-bold">Đúng sau mỗi lượt</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{Math.round(data.attempts.averageMs / 1000)}s</p>
          <p className="text-xs font-bold">Thời gian phản hồi TB</p>
        </Card>
        <Card className="p-4">
          <p className="text-3xl font-black">{data.averageReviewHours.toFixed(1)}h</p>
          <p className="text-xs font-bold">Chu kỳ review TB</p>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black">Phiên chơi theo trạng thái</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(data.sessionsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-xl bg-[#f7f3eb] p-3">
                <strong>{status}</strong>
                <Pill>{count}</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-black">Top nhiệm vụ</h2>
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
          <h2 className="text-xl font-black">Analytics events</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.events.map((item) => (
              <Pill key={item.eventName}>
                {item.eventName} · {item.count}
              </Pill>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
