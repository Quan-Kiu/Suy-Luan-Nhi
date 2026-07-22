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
    const view = renderManager();

    const policyDetails = Array.from(view.container.querySelectorAll<HTMLDetailsElement>("details"));
    expect(policyDetails).toHaveLength(8);
    const policyTitles = policyDetails.map((details) => details.querySelector("summary h3")?.textContent);
    expect(policyTitles).toEqual(expect.arrayContaining(["Ảnh huy hiệu", "Avatar bé", "Ảnh đính kèm góp ý"]));
    const missionCoverDetails = policyDetails.find(
      (details) => details.querySelector("summary h3")?.textContent === "Ảnh bìa nhiệm vụ",
    );
    expect(missionCoverDetails).toBeDefined();
    await user.click(within(missionCoverDetails!).getByText("Ảnh bìa nhiệm vụ", { selector: "h3" }));
    const missionCover = missionCoverDetails!.querySelector<HTMLFieldSetElement>(
      'fieldset[aria-label="Ảnh bìa nhiệm vụ"]',
    );
    expect(missionCover).toBeInTheDocument();
    const maxSize = within(missionCover!).getByLabelText("Dung lượng tối đa (MB)");
    await user.clear(maxSize);
    await user.type(maxSize, "4");
    await user.click(within(missionCover!).getByLabelText(/Kiểm tra chiều rộng và chiều cao/));
    await user.type(within(missionCover!).getByLabelText("Rộng tối thiểu (px)"), "800");
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
