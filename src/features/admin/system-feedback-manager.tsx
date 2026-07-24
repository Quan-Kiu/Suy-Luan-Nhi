"use client";

import { type InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Columns3 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminFeedbackApi,
  type SystemFeedbackColumnsInitialData,
  type SystemFeedbackItem,
  type SystemFeedbackPage,
} from "@/api/admin/feedback";
import {
  systemFeedbackColumnPageSize,
  systemFeedbackStatuses,
  type SystemFeedbackStatus,
} from "@/domain/system-feedback";
import { SystemFeedbackBoard, type SystemFeedbackBoardColumns } from "@/features/admin/system-feedback-board";
import { SystemFeedbackDialog } from "@/features/admin/system-feedback-dialog";
import { queryKeys } from "@/lib/query/keys";

type FeedbackInfiniteData = InfiniteData<SystemFeedbackPage>;

type UpdateVariables = {
  item: SystemFeedbackItem;
  status: SystemFeedbackStatus;
  adminNote: string;
  source: "drag" | "details";
};

function useFeedbackColumn(status: SystemFeedbackStatus, initialPage: SystemFeedbackPage) {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.feedbackColumn(status),
    queryFn: ({ pageParam }) =>
      adminFeedbackApi.list({ status, page: pageParam, pageSize: systemFeedbackColumnPageSize }),
    initialPageParam: 1,
    initialData: { pages: [initialPage], pageParams: [1] },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    staleTime: 30_000,
  });
}

function flattenFeedback(data: FeedbackInfiniteData | undefined) {
  const seen = new Set<string>();
  return (
    data?.pages.flatMap((page) =>
      page.items.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
    ) ?? []
  );
}

function withTotal(page: SystemFeedbackPage, total: number): SystemFeedbackPage {
  return {
    ...page,
    total,
    totalPages: Math.max(1, Math.ceil(total / page.pageSize)),
  };
}

function removeFeedback(data: FeedbackInfiniteData | undefined, feedbackId: string, adjustTotal: boolean) {
  if (!data) return data;
  const containsItem = data.pages.some((page) => page.items.some((item) => item.id === feedbackId));
  if (!containsItem) return data;
  const currentTotal = data.pages[0]?.total ?? 0;
  const nextTotal = adjustTotal ? Math.max(0, currentTotal - 1) : currentTotal;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...withTotal(page, nextTotal),
      items: page.items.filter((item) => item.id !== feedbackId),
    })),
  };
}

function upsertFeedback(
  data: FeedbackInfiniteData | undefined,
  item: SystemFeedbackItem,
  adjustTotal: boolean,
) {
  if (!data || !data.pages.length) return data;
  const containsItem = data.pages.some((page) => page.items.some((entry) => entry.id === item.id));
  const currentTotal = data.pages[0]?.total ?? 0;
  const nextTotal = adjustTotal && !containsItem ? currentTotal + 1 : currentTotal;
  const pages = data.pages.map((page) => ({
    ...withTotal(page, nextTotal),
    items: page.items.filter((entry) => entry.id !== item.id),
  }));
  pages[0] = { ...pages[0], items: [item, ...pages[0].items] };
  return { ...data, pages };
}

function replaceFeedback(data: FeedbackInfiniteData | undefined, item: SystemFeedbackItem) {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((entry) => (entry.id === item.id ? item : entry)),
    })),
  };
}

function toBoardColumn(query: ReturnType<typeof useFeedbackColumn>) {
  const loadError =
    query.isFetchNextPageError || (query.isError && !query.data) ? query.error.message : undefined;
  return {
    items: flattenFeedback(query.data),
    total: query.data?.pages[0]?.total ?? 0,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchingNextPage: query.isFetchingNextPage,
    errorMessage: loadError,
    onLoadMore: () => query.fetchNextPage(),
    onRetry: () => query.fetchNextPage({ cancelRefetch: false }),
  };
}

export function SystemFeedbackManager({ initialData }: { initialData: SystemFeedbackColumnsInitialData }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<SystemFeedbackItem | null>(null);
  const newQuery = useFeedbackColumn("new", initialData.new);
  const inProgressQuery = useFeedbackColumn("in_progress", initialData.in_progress);
  const resolvedQuery = useFeedbackColumn("resolved", initialData.resolved);
  const dismissedQuery = useFeedbackColumn("dismissed", initialData.dismissed);

  const columns: SystemFeedbackBoardColumns = {
    new: toBoardColumn(newQuery),
    in_progress: toBoardColumn(inProgressQuery),
    resolved: toBoardColumn(resolvedQuery),
    dismissed: toBoardColumn(dismissedQuery),
  };
  const totalFeedback = systemFeedbackStatuses.reduce((total, status) => total + columns[status].total, 0);

  const mutation = useMutation({
    mutationFn: ({ item, status, adminNote }: UpdateVariables) =>
      adminFeedbackApi.update(item.id, { status, adminNote }),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.feedback });
      const previous = queryClient.getQueriesData<FeedbackInfiniteData>({
        queryKey: queryKeys.admin.feedback,
      });
      const previousSelectedItem = selectedItem;
      const optimisticItem: SystemFeedbackItem = {
        ...variables.item,
        status: variables.status,
        adminNote: variables.adminNote || null,
      };

      if (variables.item.status === variables.status) {
        queryClient.setQueryData<FeedbackInfiniteData>(
          queryKeys.admin.feedbackColumn(variables.status),
          (current) => replaceFeedback(current, optimisticItem),
        );
      } else {
        queryClient.setQueryData<FeedbackInfiniteData>(
          queryKeys.admin.feedbackColumn(variables.item.status),
          (current) => removeFeedback(current, variables.item.id, true),
        );
        queryClient.setQueryData<FeedbackInfiniteData>(
          queryKeys.admin.feedbackColumn(variables.status),
          (current) => upsertFeedback(current, optimisticItem, true),
        );
      }
      setSelectedItem((current) => (current?.id === optimisticItem.id ? optimisticItem : current));
      return { previous, previousSelectedItem };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      setSelectedItem(context?.previousSelectedItem ?? null);
      toast.error(error.message || "Chưa cập nhật được góp ý");
    },
    onSuccess: (updated, variables) => {
      systemFeedbackStatuses.forEach((status) => {
        queryClient.setQueryData<FeedbackInfiniteData>(queryKeys.admin.feedbackColumn(status), (current) =>
          status === updated.status
            ? upsertFeedback(current, updated, true)
            : removeFeedback(current, updated.id, true),
        );
      });
      setSelectedItem((current) => (current?.id === updated.id ? updated : current));
      toast.success(
        variables.source === "drag" ? "Đã chuyển góp ý sang trạng thái mới" : "Đã cập nhật trạng thái góp ý",
      );
    },
    onSettled: (_data, _error, variables) => {
      const statuses = new Set<SystemFeedbackStatus>([variables.item.status, variables.status]);
      statuses.forEach((status) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.admin.feedbackColumn(status),
          refetchType: "active",
        });
      });
    },
  });

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
              Mỗi cột cuộn và tải thêm độc lập; kéo thẻ sang cột khác để cập nhật nhanh.
            </p>
          </div>
        </div>
        <span className="type-label font-bold text-[#786d60] sm:ml-auto sm:shrink-0">
          {totalFeedback} góp ý
        </span>
      </div>

      <SystemFeedbackBoard
        columns={columns}
        movingId={movingId}
        dragDisabled={mutation.isPending}
        onOpen={(item) => {
          mutation.reset();
          setSelectedItem(item);
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

      <SystemFeedbackDialog
        item={selectedItem}
        pending={mutation.isPending && mutation.variables?.source === "details"}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onClose={() => {
          if (!mutation.isPending) {
            mutation.reset();
            setSelectedItem(null);
          }
        }}
        onSave={async (status, adminNote) => {
          if (!selectedItem) return;
          try {
            await mutation.mutateAsync({ item: selectedItem, status, adminNote, source: "details" });
            setSelectedItem(null);
          } catch {
            // Keep the dialog open so the user can retry.
          }
        }}
      />
    </div>
  );
}
