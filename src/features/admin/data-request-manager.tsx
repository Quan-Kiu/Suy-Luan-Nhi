"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { requestJson } from "@/lib/http";

type RequestItem = {
  id: string;
  type: "export" | "delete";
  status: string;
  requestedAt: Date;
  completedAt: Date | null;
  parentDisplayName: string;
  userEmail: string;
};

export function DataRequestManager({ items }: { items: RequestItem[] }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-[#f7f3eb] text-left">
          <tr>
            <th className="p-3">Yêu cầu</th>
            <th className="p-3">Tài khoản</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Xử lý</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3 font-black">{item.type}</td>
              <td className="p-3">
                <strong className="block">{item.parentDisplayName}</strong>
                <small>{item.userEmail}</small>
              </td>
              <td className="p-3">{item.status}</td>
              <td className="p-3">{new Date(item.requestedAt).toLocaleString("vi-VN")}</td>
              <td className="p-3">
                {item.type === "delete" && item.status === "pending" ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("Xử lý yêu cầu xóa: hồ sơ sẽ được anonymize và khóa đăng nhập?"))
                        return;
                      try {
                        await requestJson(`/api/admin/data-requests/${item.id}/process`, { method: "POST" });
                        toast.success("Đã xử lý yêu cầu xóa dữ liệu");
                        router.refresh();
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Không thể xử lý");
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 font-black text-white"
                  >
                    <LoaderCircle size={16} /> Xử lý xóa
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-green-700">
                    <CheckCircle2 size={16} /> Không cần thao tác
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
