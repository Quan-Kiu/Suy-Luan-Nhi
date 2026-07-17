"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { reviewsApi } from "@/api/admin/reviews";
import { AsyncButton } from "@/components/async-button";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";

const schema = z.object({ scheduledFor: z.string().min(1, "Hãy chọn thời gian xuất bản") });
type FormValues = z.infer<typeof schema>;

export function ReviewPublishActions({ missionId, versionId }: { missionId: string; versionId: string }) {
  const content = useContent("admin");
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { scheduledFor: "" } });
  const publishMutation = useMutation({
    mutationFn: () => reviewsApi.publish(missionId, versionId),
    onSuccess: () => {
      toast.success(contentText(content, "review.publishSuccess", "Nhiệm vụ đã được hiển thị cho trẻ"));
      router.refresh();
    },
  });
  const scheduleMutation = useMutation({
    mutationFn: ({ scheduledFor }: FormValues) =>
      reviewsApi.schedule(missionId, versionId, new Date(scheduledFor).toISOString()),
    onSuccess: () => {
      toast.success(contentText(content, "review.scheduleSuccess", "Đã lên lịch xuất bản"));
      router.refresh();
    },
  });

  return (
    <div className="space-y-3">
      <AsyncButton
        pending={publishMutation.isPending}
        pendingLabel={contentText(content, "review.publishing", "Đang xuất bản...")}
        onClick={() => publishMutation.mutate()}
        disabled={scheduleMutation.isPending}
        className="w-full bg-[#5d8c48] shadow-none"
      >
        <Rocket size={18} className="mr-2 inline" />
        {contentText(content, "review.publish", "Xuất bản ngay")}
      </AsyncButton>
      <form
        onSubmit={form.handleSubmit((values) => scheduleMutation.mutate(values))}
        className="rounded-xl border bg-[#f7f3eb] p-3"
        noValidate
      >
        <TextField
          type="datetime-local"
          label={contentText(content, "review.scheduleTitle", "Hoặc lên lịch xuất bản")}
          registration={form.register("scheduledFor")}
          error={form.formState.errors.scheduledFor?.message}
          className="bg-white font-normal"
        />
        <SubmitButton
          pending={scheduleMutation.isPending}
          pendingLabel={contentText(content, "review.scheduling", "Đang lên lịch...")}
          disabled={publishMutation.isPending}
          className="mt-3 border border-[#5d8c48] bg-white text-[#4d743b] shadow-none"
        >
          {contentText(content, "review.schedule", "Lưu lịch xuất bản")}
        </SubmitButton>
      </form>
      <FormStatus
        status={publishMutation.isError || scheduleMutation.isError ? "error" : "idle"}
        message={(publishMutation.error ?? scheduleMutation.error)?.message}
      />
    </div>
  );
}
