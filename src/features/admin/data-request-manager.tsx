"use client";

import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { dataRequestsApi } from "@/api/admin/data-requests";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { usePendingRouter } from "@/hooks/use-pending-router";

const typeLabels: Record<string, string> = {
  export: "Tải xuống dữ liệu",
  delete: "Xóa dữ liệu gia đình",
};

const statusLabels: Record<string, string> = {
  pending: "Đang chờ xử lý",
  processing: "Đang xử lý",
  completed: "Đã hoàn thành",
  failed: "Xử lý thất bại",
  cancelled: "Đã hủy",
};

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
  const navigation = usePendingRouter();
  const [deleteTarget, setDeleteTarget] = useState<RequestItem | null>(null);
  const mutation = useMutation({
    mutationFn: (requestId: string) => dataRequestsApi.process(requestId),
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("Đã hoàn tất yêu cầu xóa dữ liệu");
      navigation.refresh();
    },
  });

  return (
    <div className="space-y-3">
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
            {items.map((item) => {
              const pending = navigation.isPending || (mutation.isPending && mutation.variables === item.id);
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3 font-black">{typeLabels[item.type] ?? item.type}</td>
                  <td className="p-3">
                    <strong className="block">{item.parentDisplayName}</strong>
                    <small>{item.userEmail}</small>
                  </td>
                  <td className="p-3">{statusLabels[item.status] ?? item.status}</td>
                  <td className="p-3">{new Date(item.requestedAt).toLocaleString("vi-VN")}</td>
                  <td className="p-3">
                    {item.type === "delete" && item.status === "pending" ? (
                      <button
                        type="button"
                        disabled={pending}
                        aria-busy={pending}
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 font-black text-white disabled:opacity-50"
                      >
                        <LoaderCircle size={16} className={pending ? "animate-spin" : undefined} />
                        {pending ? "Đang xử lý..." : "Xử lý xóa"}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-green-700">
                        <CheckCircle2 size={16} /> Không cần thao tác
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận đã xóa dữ liệu gia đình?"
        description={`Toàn bộ hồ sơ trẻ và dữ liệu liên quan của ${deleteTarget?.parentDisplayName ?? "gia đình"} sẽ bị xóa. Tài khoản sẽ không thể đăng nhập lại sau khi xử lý.`}
        confirmLabel="Xác nhận xóa dữ liệu"
        pendingLabel="Đang xử lý..."
        tone="danger"
        pending={mutation.isPending || navigation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && mutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
