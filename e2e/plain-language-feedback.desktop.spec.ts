import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("incorrect answers use clear copy and a non-success retry style", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));

  await page.goto("/missions/footprint-detective");
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.getByRole("button", { name: "Mặt trăng", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();

  await expect(page.getByText("Chưa chính xác", { exact: true })).toBeVisible();
  await expect(page.getByText(/chưa (?:trúng|chúng)/i)).toHaveCount(0);
  const retryButton = page.getByRole("button", { name: "Thử lại", exact: true });
  await expect(retryButton).toHaveAttribute("class", /border-\[#d99539\]/);
  await expect(retryButton).not.toHaveAttribute("class", /green|6c9951/i);
});
