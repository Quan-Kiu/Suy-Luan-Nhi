"use client";

import { useMutation } from "@tanstack/react-query";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { membersApi } from "@/api/admin/members";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { MemberItem } from "@/features/admin/member-row";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function MemberTrashActions({
  item,
  mode,
  currentUserId,
}: {
  item: MemberItem;
  mode: "active" | "trash";
  currentUserId: string;
}) {
  const navigation = usePendingRouter();
  const [confirmAction, setConfirmAction] = useState<"trash" | "permanent" | null>(null);
  const mutation = useMutation({
    mutationFn: async (action: "trash" | "restore" | "permanent") => {
      if (action === "trash") return membersApi.trash(item.id);
      if (action === "restore") return membersApi.restore(item.id);
      return membersApi.permanentDelete(item.id);
    },
    onSuccess: (_, action) => {
      toast.success(
        action === "trash"
          ? "Đã đưa tài khoản vào thùng rác và thu hồi các phiên đăng nhập"
          : action === "restore"
            ? "Đã khôi phục tài khoản"
            : "Đã xóa vĩnh viễn tài khoản và dữ liệu gia đình liên quan",
      );
      setConfirmAction(null);
      navigation.refresh();
    },
  });
  const pending = mutation.isPending || navigation.isPending;
  const disabled = item.id === currentUserId || pending;

  if (mode === "active") {
    return (
      <>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setConfirmAction("trash")}
          className="type-action inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-red-700 disabled:opacity-30"
        >
          <Trash2 size={16} /> Đưa vào thùng rác
        </button>
        <ConfirmDialog
          open={confirmAction === "trash"}
          title={`Đưa ${item.name} vào thùng rác?`}
          description="Tài khoản sẽ bị đăng xuất khỏi mọi thiết bị và không thể đăng nhập cho đến khi được khôi phục. Dữ liệu chưa bị xóa vĩnh viễn."
          confirmLabel="Đưa vào thùng rác"
          pendingLabel="Đang chuyển..."
          tone="warning"
          pending={pending}
          errorMessage={mutation.isError ? mutation.error.message : undefined}
          onClose={() => !pending && setConfirmAction(null)}
          onConfirm={() => mutation.mutate("trash")}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => mutation.mutate("restore")}
          className="type-action inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-green-200 px-3 py-2 text-green-700 disabled:opacity-40"
        >
          <RotateCcw size={16} />{" "}
          {mutation.variables === "restore" && pending ? "Đang khôi phục..." : "Khôi phục"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setConfirmAction("permanent")}
          className="type-action inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-red-700 disabled:opacity-30"
        >
          <Trash2 size={16} /> Xóa vĩnh viễn
        </button>
      </div>
      {mutation.isError && confirmAction !== "permanent" ? (
        <p role="alert" className="type-caption mt-2 font-bold text-red-700">
          {mutation.error.message}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmAction === "permanent"}
        title={`Xóa vĩnh viễn ${item.name}?`}
        description="Thao tác này xóa tài khoản, hồ sơ phụ huynh, hồ sơ bé và dữ liệu phụ thuộc theo chính sách cơ sở dữ liệu. Không thể hoàn tác."
        confirmLabel="Xóa vĩnh viễn"
        pendingLabel="Đang xóa..."
        tone="danger"
        pending={pending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onClose={() => !pending && setConfirmAction(null)}
        onConfirm={() => mutation.mutate("permanent")}
      />
    </>
  );
}
