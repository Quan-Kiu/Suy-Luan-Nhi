import { expect, test } from "@playwright/test";
import { auditRoute } from "./audit-helpers";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

const seenReleaseStorageKey = "sln.parent.seen-release-version";

test("parent release notes announce once and pass desktop UX checks", async ({ page }, testInfo) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);

  await page.evaluate((key) => window.localStorage.removeItem(key), seenReleaseStorageKey);
  await page.reload();

  await expect(page.getByText("Có cập nhật mới")).toBeVisible();
  await page.getByRole("link", { name: "Xem thay đổi" }).click();
  await page.waitForURL("**/parent/whats-new");
  await expect(page.getByRole("heading", { name: "Những thay đổi dành cho gia đình" })).toBeVisible();
  await expect(page.getByText("Tính năng mới").first()).toBeVisible();
  await expect(page.getByText("Bảo mật").first()).toBeVisible();

  await auditRoute(page, testInfo, "/parent/whats-new", "desktop-parent-whats-new");
  await page.goto("/parent");
  await expect(page.getByText("Có cập nhật mới")).toHaveCount(0);
});
