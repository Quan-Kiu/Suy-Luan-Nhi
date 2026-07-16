import { listAuditLogs } from "@/modules/admin/operations";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ resourceType?: string; action?: string }>;
}) {
  const filters = await searchParams;
  const items = await listAuditLogs(filters);
  return (
    <div>
      <h1 className="text-3xl font-black">Audit log</h1>
      <p className="mt-2 text-[#806d54]">
        Lịch sử bất biến cho thao tác quản trị, nội dung, dữ liệu và quyền truy cập.
      </p>
      <form className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          name="resourceType"
          defaultValue={filters.resourceType}
          placeholder="resource type"
          className="min-h-11 rounded-xl border px-3"
        />
        <input
          name="action"
          defaultValue={filters.action}
          placeholder="action contains"
          className="min-h-11 rounded-xl border px-3"
        />
        <button className="rounded-xl bg-[#3f392f] px-4 font-black text-white">Lọc</button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-[#f7f3eb] text-left">
            <tr>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t align-top">
                <td className="p-3 whitespace-nowrap">{item.createdAt.toLocaleString("vi-VN")}</td>
                <td className="p-3 font-black">{item.action}</td>
                <td className="p-3">
                  {item.resourceType}
                  <br />
                  <code>{item.resourceId}</code>
                </td>
                <td className="p-3">
                  <code>{item.actorId ?? "system"}</code>
                </td>
                <td className="max-w-md p-3">
                  <pre className="break-all whitespace-pre-wrap">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
