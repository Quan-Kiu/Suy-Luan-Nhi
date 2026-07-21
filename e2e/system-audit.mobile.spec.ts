import { expect, test } from "@playwright/test";
import { auditRoute } from "./audit-helpers";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.setTimeout(180_000);

test("public mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await auditRoute(page, testInfo, "/", "mobile-public-landing");
  await page.locator('button[aria-controls="landing-mobile-nav"]').click();
  await auditRoute(page, testInfo, "/auth/sign-in", "mobile-auth-sign-in");
  await auditRoute(page, testInfo, "/auth/sign-up", "mobile-auth-sign-up");
});

test("parent and child mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await auditRoute(page, testInfo, "/profiles", "mobile-parent-profiles");
  await auditRoute(page, testInfo, "/missions", "mobile-child-mission-map");

  const missionHref = await page.locator('a[href^="/missions/"]').first().getAttribute("href");
  expect(missionHref).toBeTruthy();
  await auditRoute(page, testInfo, missionHref!, "mobile-child-mission-detail");

  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.waitForURL(/\/play\//);
  await auditRoute(page, testInfo, new URL(page.url()).pathname, "mobile-child-gameplay", {
    screenshot: false,
  });
  await page.getByRole("button", { name: /Dừng và lưu tiến độ/i }).click();
  await page.waitForURL(/\/missions$/);

  await unlockParentGate(page);
  await auditRoute(page, testInfo, "/parent", "mobile-parent-dashboard");
  await auditRoute(page, testInfo, "/parent/settings", "mobile-parent-settings");
});

test("admin mobile routes pass runtime UX checks", async ({ page }, testInfo) => {
  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin");
  await auditRoute(page, testInfo, "/admin", "mobile-editor-dashboard");
  await auditRoute(page, testInfo, "/admin/missions", "mobile-editor-missions");
  await auditRoute(page, testInfo, "/admin/missions/new", "mobile-editor-new-mission");

  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin");
  await auditRoute(page, testInfo, "/admin/members", "mobile-super-admin-members");
  await auditRoute(page, testInfo, "/admin/settings", "mobile-super-admin-settings");
});
