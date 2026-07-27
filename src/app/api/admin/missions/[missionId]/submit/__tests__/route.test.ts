import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireApiPermission } from "@/auth/api";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { submitMissionForReview } from "@/modules/admin/mission-admin";
import { POST } from "../route";

vi.mock("@/auth/api", () => ({ requireApiPermission: vi.fn() }));
vi.mock("@/lib/cache/invalidation", () => ({ invalidateAdminMissionViews: vi.fn() }));
vi.mock("@/modules/admin/mission-admin", () => ({ submitMissionForReview: vi.fn() }));

const missionId = "e951fe9f-5439-40af-b2c4-edc2c0baa385";
const request = new Request(`http://localhost/api/admin/missions/${missionId}/submit`, {
  method: "POST",
});

describe("POST /api/admin/missions/[missionId]/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiPermission).mockResolvedValue({
      session: { user: { id: "actor-1" } },
    } as Awaited<ReturnType<typeof requireApiPermission>>);
  });

  it("returns a review-required error when referenced media is not approved", async () => {
    const media = ["https://example.com/pending-cover.png"];
    vi.mocked(submitMissionForReview).mockResolvedValue({
      error: "media_unapproved",
      media,
    });

    const response = await POST(request, { params: Promise.resolve({ missionId }) });
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: "MISSION_MEDIA_REVIEW_REQUIRED",
        message: expect.stringContaining("tư liệu chưa được kiểm tra"),
        details: { media },
      },
    });
    expect(invalidateAdminMissionViews).not.toHaveBeenCalled();
  });

  it("keeps a genuine missing mission as not found", async () => {
    vi.mocked(submitMissionForReview).mockResolvedValue({ error: "not_found" });

    const response = await POST(request, { params: Promise.resolve({ missionId }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: { code: "NOT_FOUND", message: "Không tìm thấy nhiệm vụ" },
    });
  });
});
