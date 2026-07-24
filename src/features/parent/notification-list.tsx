"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { parentApi } from "@/api/parent";
import { FormStatus } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const content = useContent("parent");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (notificationId: string) => parentApi.markNotificationRead(notificationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.parent.notifications }),
        queryClient.invalidateQueries({ queryKey: queryKeys.parent.dashboard }),
      ]);
      navigation.refresh();
    },
  });

  if (items.length === 0) {
    return (
      <Card className="grid min-h-64 place-items-center p-6 text-center sm:p-8">
        <div className="max-w-md">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#edf4df] text-[#50723e]">
            <BellRing size={30} aria-hidden="true" />
          </div>
          <h2 className="type-section-title mt-4">
            {contentText(content, "notifications.emptyTitle", "Chưa có thông báo mới")}
          </h2>
          <p className="type-supporting mt-2 text-[#6f604b]">
            {contentText(
              content,
              "notifications.emptyDescription",
              "Khi bé hoàn thành nhiệm vụ hoặc có cập nhật quan trọng, thông báo sẽ xuất hiện tại đây.",
            )}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pending = navigation.isPending || (mutation.isPending && mutation.variables === item.id);
        return (
          <button
            type="button"
            key={item.id}
            aria-busy={pending}
            disabled={pending || Boolean(item.readAt)}
            onClick={() => mutation.mutate(item.id)}
            className={cn(
              "w-full rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed",
              item.readAt ? "bg-white" : "border-[#e6a35e] bg-[#fff5df] hover:border-[#d98732]",
              pending && "opacity-60",
            )}
          >
            <div className="flex justify-between gap-3">
              <strong>{item.title}</strong>
              <time className="type-caption text-[#786348]">
                {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </time>
            </div>
            <p className="type-supporting mt-1 text-[#6f604b]">{item.body}</p>
          </button>
        );
      })}
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
    </div>
  );
}
