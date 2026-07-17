"use client";

import { ReviewDecisionForm } from "@/features/admin/review-decision-form";
import { ReviewPublishActions } from "@/features/admin/review-publish-actions";

export function ReviewActions({
  missionId,
  versionId,
  status,
}: {
  missionId: string;
  versionId: string;
  status: string;
}) {
  if (status === "approved") {
    return <ReviewPublishActions missionId={missionId} versionId={versionId} />;
  }
  if (status === "in_review") {
    return <ReviewDecisionForm missionId={missionId} versionId={versionId} />;
  }
  return null;
}
