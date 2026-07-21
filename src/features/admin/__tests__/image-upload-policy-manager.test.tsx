import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { systemSettingsApi } from "@/api/admin/settings";
import { defaultImageUploadPolicies, mediaUploadPolicySettingKey } from "@/domain/media-upload-policy";
import { ImageUploadPolicyManager } from "@/features/admin/image-upload-policy-manager";

function renderManager() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ImageUploadPolicyManager initialPolicies={defaultImageUploadPolicies} />
    </QueryClientProvider>,
  );
}

describe("ImageUploadPolicyManager", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("saves configurable size and dimension rules for each image purpose", async () => {
    const save = vi.spyOn(systemSettingsApi, "save").mockImplementation(async (key, value) => ({
      key,
      value,
      updatedAt: new Date().toISOString(),
    }));
    const user = userEvent.setup();
    renderManager();

    expect(screen.getAllByRole("group")).toHaveLength(5);
    const missionCover = screen.getByRole("group", { name: "Ảnh bìa nhiệm vụ" });
    const maxSize = within(missionCover).getByLabelText("Dung lượng tối đa (MB)");
    await user.clear(maxSize);
    await user.type(maxSize, "4");
    await user.click(within(missionCover).getByLabelText(/Kiểm tra chiều rộng và chiều cao/));
    await user.type(within(missionCover).getByLabelText("Rộng tối thiểu (px)"), "800");
    await user.click(screen.getByRole("button", { name: "Lưu giới hạn tải ảnh" }));

    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith(
      mediaUploadPolicySettingKey,
      expect.objectContaining({
        "mission-cover": expect.objectContaining({
          maxSizeMb: 4,
          dimensionValidationEnabled: true,
          minWidth: 800,
        }),
      }),
    );
  });
});
