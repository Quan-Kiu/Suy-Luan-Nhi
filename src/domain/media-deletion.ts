export type MediaReferenceCounts = {
  childAvatars: number;
  missionCovers: number;
  badgeIcons: number;
  worldCovers: number;
  resourceMedia: number;
  questionPayloads: number;
  versionSnapshots: number;
  feedbackAttachments: number;
};

export type BlockingMediaReference = Exclude<keyof MediaReferenceCounts, "feedbackAttachments">;

const mediaReferenceLabels: Record<BlockingMediaReference, string> = {
  childAvatars: "hồ sơ bé",
  missionCovers: "nhiệm vụ",
  badgeIcons: "huy hiệu",
  worldCovers: "chủ đề",
  resourceMedia: "bài viết dành cho phụ huynh",
  questionPayloads: "câu hỏi",
  versionSnapshots: "phiên bản nội dung đang duyệt hoặc đã xuất bản",
};

export function getBlockingMediaReferences(references: MediaReferenceCounts) {
  return (Object.keys(mediaReferenceLabels) as BlockingMediaReference[]).filter((key) => references[key] > 0);
}

export class MediaInUseError extends Error {
  readonly status = 409;
  readonly code = "MEDIA_IN_USE";

  constructor(readonly references: BlockingMediaReference[]) {
    const labels = references.map((reference) => mediaReferenceLabels[reference]);
    super(`Tệp đang được dùng trong ${labels.join(", ")}. Hãy thay tệp ở nơi đang sử dụng trước khi xóa.`);
    this.name = "MediaInUseError";
  }
}
