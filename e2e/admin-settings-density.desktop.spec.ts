import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("system settings stay compact and expand into usable forms", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, "admin@demo.local", "/admin/settings");

  const settingPanel = page
    .locator("details")
    .filter({ has: page.getByRole("heading", { name: "Số hồ sơ bé tối đa mỗi gia đình" }) });
  await expect(settingPanel).not.toHaveAttribute("open", "");
  await settingPanel.locator(":scope > summary").click();
  await expect(settingPanel.getByLabel("Giá trị (hồ sơ)")).toBeVisible();
  await expect(settingPanel.getByRole("button", { name: "Lưu thay đổi" })).toBeVisible();

  const uploadPanel = page
    .locator("details")
    .filter({ has: page.getByRole("heading", { name: "Ảnh bìa nhiệm vụ" }) });
  await expect(uploadPanel).not.toHaveAttribute("open", "");
  await uploadPanel.locator(":scope > summary").click();
  await expect(uploadPanel.getByLabel("Dung lượng tối đa (MB)")).toBeVisible();
});
