"use client";

import { AlertCircle, CheckCircle2, Cloud, CloudOff, LoaderCircle } from "lucide-react";
import { contentTemplate, contentText, useContent } from "@/content/client";

export type MissionAutosaveState = "idle" | "unsaved" | "saving" | "saved" | "invalid" | "error" | "conflict";

export function MissionAutosaveStatus({
  state,
  lastSavedAt,
}: {
  state: MissionAutosaveState;
  lastSavedAt: Date | null;
}) {
  const content = useContent("admin");
  const time = lastSavedAt?.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const presentation = {
    idle: {
      icon: Cloud,
      text: contentText(content, "missionEditor.autosave.idle", "Tự động lưu đang bật"),
      tone: "text-[#6f6558]",
    },
    unsaved: {
      icon: CloudOff,
      text: contentText(content, "missionEditor.autosave.unsaved", "Có thay đổi chưa lưu"),
      tone: "text-amber-700",
    },
    saving: {
      icon: LoaderCircle,
      text: contentText(content, "missionEditor.autosave.saving", "Đang tự động lưu..."),
      tone: "text-[#315c8a]",
    },
    saved: {
      icon: CheckCircle2,
      text: time
        ? contentTemplate(content, "missionEditor.autosave.savedAt", "Đã tự động lưu lúc {time}", {
            time,
          })
        : contentText(content, "missionEditor.autosave.idle", "Tự động lưu đang bật"),
      tone: "text-[#3f6f35]",
    },
    invalid: {
      icon: AlertCircle,
      text: contentText(content, "missionEditor.autosave.invalid", "Chưa tự lưu vì còn mục chưa hợp lệ"),
      tone: "text-amber-700",
    },
    error: {
      icon: AlertCircle,
      text: contentText(
        content,
        "missionEditor.autosave.error",
        "Tự động lưu thất bại — thay đổi vẫn còn trên màn hình",
      ),
      tone: "text-red-700",
    },
    conflict: {
      icon: AlertCircle,
      text: contentText(
        content,
        "missionEditor.autosave.conflict",
        "Bản nháp có thay đổi mới hơn ở nơi khác — hãy tải lại trang",
      ),
      tone: "text-red-700",
    },
  } satisfies Record<MissionAutosaveState, { icon: typeof Cloud; text: string; tone: string }>;

  const current = presentation[state];
  const Icon = current.icon;
  const isAlert = state === "error" || state === "conflict";

  return (
    <div
      role={isAlert ? "alert" : "status"}
      aria-live={isAlert ? "assertive" : "polite"}
      data-state={state}
      className={`type-caption inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f6f1e8] px-3 font-bold ${current.tone}`}
    >
      <Icon size={15} className={state === "saving" ? "animate-spin" : undefined} aria-hidden="true" />
      <span>{current.text}</span>
    </div>
  );
}
