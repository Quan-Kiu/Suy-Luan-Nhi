"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { reviewsApi } from "@/api/admin/reviews";
import { AsyncButton } from "@/components/async-button";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";

const schema = z.object({ scheduledFor: z.string().min(1, "Hãy chọn thời gian hiển thị") });
type FormValues = z.infer<typeof schema>;

export function ReviewPublishActions({ missionId, versionId }: { missionId: string; versionId: string }) {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { scheduledFor: "" } });
  const publishMutation = useMutation({
    mutationFn: () => reviewsApi.publish(missionId, versionId),
    onSuccess: () => {
      toast.success(contentText(content, "review.publishSuccessTitle", "Đã cho bé xem"), {
        description: contentText(
          content,
          "review.publishSuccess",
          "Nhiệm vụ đã xuất hiện trong khu vực của bé",
        ),
        id: `mission-publish-${versionId}`,
        duration: 8000,
      });
      navigation.refresh();
    },
  });
  const scheduleMutation = useMutation({
    mutationFn: ({ scheduledFor }: FormValues) =>
      reviewsApi.schedule(missionId, versionId, new Date(scheduledFor).toISOString()),
    onSuccess: () => {
      toast.success(contentText(content, "review.scheduleSuccessTitle", "Đã lưu thời gian hiển thị"), {
        description: contentText(
          content,
          "review.scheduleSuccess",
          "Nhiệm vụ sẽ tự động xuất hiện cho bé vào thời gian đã chọn",
        ),
        id: `mission-schedule-${versionId}`,
        duration: 8000,
      });
      navigation.refresh();
    },
  });

  return (
    <div className="space-y-3">
      <AsyncButton
        pending={publishMutation.isPending || navigation.isPending}
        pendingLabel={contentText(content, "review.publishing", "Đang đưa nội dung lên...")}
        onClick={() => publishMutation.mutate()}
        disabled={scheduleMutation.isPending || navigation.isPending}
        className="w-full bg-[#517d3f] shadow-none"
      >
        <Rocket size={18} className="mr-2 inline" />
        {contentText(content, "review.publish", "Cho bé xem ngay")}
      </AsyncButton>
      <form
        onSubmit={form.handleSubmit((values) => scheduleMutation.mutate(values))}
        className="rounded-xl border bg-[#f7f3eb] p-3"
        noValidate
      >
        <TextField
          type="datetime-local"
          label={contentText(content, "review.scheduleTitle", "Hoặc chọn thời gian hiển thị")}
          registration={form.register("scheduledFor")}
          error={form.formState.errors.scheduledFor?.message}
          className="bg-white font-normal"
        />
        <SubmitButton
          pending={scheduleMutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "review.scheduling", "Đang lưu thời gian...")}
          disabled={publishMutation.isPending || navigation.isPending}
          className="mt-3 border border-[#517d3f] bg-white text-[#4d743b] shadow-none"
        >
          {contentText(content, "review.schedule", "Lưu thời gian hiển thị")}
        </SubmitButton>
      </form>
      <FormStatus
        status={publishMutation.isError || scheduleMutation.isError ? "error" : "idle"}
        message={(publishMutation.error ?? scheduleMutation.error)?.message}
      />
    </div>
  );
}
