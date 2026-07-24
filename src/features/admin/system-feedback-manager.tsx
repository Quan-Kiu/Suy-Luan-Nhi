"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Columns3, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { adminFeedbackApi, type SystemFeedbackItem, type SystemFeedbackPage } from "@/api/admin/feedback";
import { FormStatus } from "@/components/form";
import type { SystemFeedbackStatus } from "@/domain/system-feedback";
import { SystemFeedbackBoard } from "@/features/admin/system-feedback-board";
import { SystemFeedbackDialog } from "@/features/admin/system-feedback-dialog";
import { queryKeys } from "@/lib/query/keys";

type UpdateVariables = {
  item: SystemFeedbackItem;
  status: SystemFeedbackStatus;
  adminNote: string;
  source: "drag" | "details";
};

export function SystemFeedbackManager({ initialData }: { initialData: SystemFeedbackPage }) {
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: queryKeys.admin.feedback,
    queryFn: () => adminFeedbackApi.list(),
    initialData,
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: ({ item, status, adminNote }: UpdateVariables) =>
      adminFeedbackApi.update(item.id, { status, adminNote }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.feedback });
      const previous = queryClient.getQueryData<SystemFeedbackPage>(queryKeys.admin.feedback);
      queryClient.setQueryData<SystemFeedbackPage>(queryKeys.admin.feedback, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === variables.item.id
              ? { ...item, status: variables.status, adminNote: variables.adminNote || null }
              : item,
          ),
        };
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.admin.feedback, context.previous);
      }
      toast.error(error.message || "Chưa cập nhật được góp ý");
    },
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<SystemFeedbackPage>(queryKeys.admin.feedback, (current) => {
        if (!current) return current;
        return {
          ...current,
          items: current.items.map((item) => (item.id === updated.id ? updated : item)),
        };
      });
      toast.success(
        variables.source === "drag" ? "Đã chuyển góp ý sang trạng thái mới" : "Đã cập nhật trạng thái góp ý",
      );
    },
  });

  const items = query.data?.items ?? [];
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const movingId = mutation.isPending ? mutation.variables?.item.id : undefined;

  async function updateFeedback(variables: UpdateVariables) {
    try {
      await mutation.mutateAsync(variables);
    } catch {
      // Error feedback and optimistic rollback are handled by the mutation callbacks.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e4d8c5] bg-white px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
            <Columns3 size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="type-action font-black text-[#342f28]">Bảng tiến độ góp ý</p>
            <p className="type-caption mt-0.5 text-[#786d60]">
              Kéo thẻ sang cột khác để cập nhật nhanh; mở chi tiết để xem ảnh và ghi chú xử lý.
            </p>
          </div>
        </div>
        <span className="type-label font-bold text-[#786d60] sm:ml-auto sm:shrink-0">
          {query.data?.total ?? 0} góp ý
        </span>
      </div>

      {query.isLoading ? (
        <div className="rounded-3xl border bg-white p-10 text-center font-bold text-[#786d60]">
          Đang tải góp ý...
        </div>
      ) : query.isError ? (
        <FormStatus status="error" message={query.error.message} />
      ) : items.length ? (
        <SystemFeedbackBoard
          items={items}
          movingId={movingId}
          dragDisabled={mutation.isPending}
          onOpen={(item) => {
            mutation.reset();
            setSelectedItemId(item.id);
          }}
          onMove={(item, status) =>
            updateFeedback({
              item,
              status,
              adminNote: item.adminNote ?? "",
              source: "drag",
            })
          }
        />
      ) : (
        <div className="rounded-3xl border border-dashed bg-white p-10 text-center">
          <MessageSquareText className="mx-auto mb-3 size-8 text-[#a49685]" aria-hidden="true" />
          <p className="type-card-title">Chưa có góp ý</p>
          <p className="type-supporting mt-2 text-[#786d60]">Các góp ý mới sẽ xuất hiện trên bảng này.</p>
        </div>
      )}

      <SystemFeedbackDialog
        item={selectedItem}
        pending={mutation.isPending && mutation.variables?.source === "details"}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onClose={() => {
          if (!mutation.isPending) {
            mutation.reset();
            setSelectedItemId(null);
          }
        }}
        onSave={async (status, adminNote) => {
          if (!selectedItem) return;
          try {
            await mutation.mutateAsync({ item: selectedItem, status, adminNote, source: "details" });
            setSelectedItemId(null);
          } catch {
            // Keep the dialog open so the user can retry.
          }
        }}
      />
    </div>
  );
}
