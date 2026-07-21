import { describe, expect, it } from "vitest";
import {
  getBlockingMediaReferences,
  MediaInUseError,
  type MediaReferenceCounts,
} from "@/domain/media-deletion";

const emptyReferences: MediaReferenceCounts = {
  missionCovers: 0,
  badgeIcons: 0,
  worldCovers: 0,
  resourceMedia: 0,
  questionPayloads: 0,
  versionSnapshots: 0,
  feedbackAttachments: 0,
};

describe("media deletion policy", () => {
  it("allows deleting an image that is only attached to system feedback", () => {
    expect(getBlockingMediaReferences({ ...emptyReferences, feedbackAttachments: 2 })).toEqual([]);
  });

  it("blocks deletion while the file is used by published or editable content", () => {
    const references = getBlockingMediaReferences({
      ...emptyReferences,
      missionCovers: 1,
      questionPayloads: 3,
      feedbackAttachments: 2,
    });

    expect(references).toEqual(["missionCovers", "questionPayloads"]);
    expect(new MediaInUseError(references).message).toContain("nhiệm vụ, câu hỏi");
  });
});
