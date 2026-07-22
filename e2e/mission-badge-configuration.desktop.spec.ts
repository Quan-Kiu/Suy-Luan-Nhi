import { expect, test } from "@playwright/test";
import { demoPassword } from "./helpers";

test("mission editor exposes a visual badge configuration", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/auth/sign-in?callbackUrl=%2Fadmin%2Fmissions%2Fnew");
  await page.getByLabel("Email").fill("content@demo.local");
  await page.locator('input[name="password"]').fill(demoPassword);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL("**/admin/missions/new");

  const section = page.getByRole("region", { name: "Huy hiệu khi hoàn thành" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("link", { name: "Quản lý huy hiệu" })).toBeVisible();
  await expect(section.getByRole("radio", { name: /Không trao huy hiệu/ })).toBeVisible();
  expect(await section.getByRole("radio").count()).toBeGreaterThan(1);

  const badgeToAssign = section.getByRole("radio").last();
  await badgeToAssign.locator("..").click();
  await expect(badgeToAssign).toBeChecked();

  await section.scrollIntoViewIfNeeded();
  await section.screenshot({ path: ".verification/browser/mission-badge-configuration.png" });
});
