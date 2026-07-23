export type FeedbackImageSource = "auto" | "upload";
export type FeedbackCaptureMode = FeedbackImageSource | "mixed" | "none";

export type FeedbackAttachmentDraft = {
  id: string;
  file: File;
  source: FeedbackImageSource;
  annotated: boolean;
  displayName: string;
  selectionKey: string;
};

export function feedbackFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function createFeedbackAttachment(file: File, source: FeedbackImageSource): FeedbackAttachmentDraft {
  const uniqueId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    id: `${source}-${uniqueId}`,
    file,
    source,
    annotated: false,
    displayName: file.name,
    selectionKey: feedbackFileKey(file),
  };
}

export function getFeedbackCaptureMode(attachments: FeedbackAttachmentDraft[]): FeedbackCaptureMode {
  if (!attachments.length) return "none";
  const sources = new Set(attachments.map((attachment) => attachment.source));
  if (sources.size > 1) return "mixed";
  return attachments[0]?.source ?? "none";
}
