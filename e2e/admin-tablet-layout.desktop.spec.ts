import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

const routes = [
  "/admin",
  "/admin/missions",
  "/admin/missions/new",
  "/admin/reviews",
  "/admin/resources",
  "/admin/resources/new",
  "/admin/content",
  "/admin/content-variables",
  "/admin/media",
  "/admin/worlds",
  "/admin/taxonomy",
  "/admin/reports",
  "/admin/audit",
  "/admin/data-requests",
  "/admin/access-control",
  "/admin/settings",
  "/admin/feedback",
] as const;

const tabletViewports = [
  { name: "portrait", width: 820, height: 1180 },
  { name: "landscape", width: 1180, height: 820 },
] as const;
async function expectNoViewportOverflow(page: import("@playwright/test").Page, route: string) {
  const audit = await page.evaluate(() => {
    const root = document.documentElement;
    const main = document.querySelector("main.min-w-0")?.getBoundingClientRect();
    return {
      documentOverflow: root.scrollWidth - window.innerWidth,
      mainLeft: main?.left ?? -1,
      mainRight: main?.right ?? -1,
      viewportWidth: window.innerWidth,
    };
  });

  expect(audit.documentOverflow, `${route} tràn ngang`).toBeLessThanOrEqual(1);
  expect(audit.mainLeft, `${route} main lệch khỏi cạnh trái`).toBeGreaterThanOrEqual(0);
  expect(audit.mainRight, `${route} main vượt cạnh phải`).toBeLessThanOrEqual(audit.viewportWidth + 1);
}

async function expectAdminShellMatchesViewport(page: import("@playwright/test").Page) {
  const width = page.viewportSize()?.width ?? 0;
  const menuButton = page.getByRole("button", { name: "Mở menu quản trị" });
  const desktopNavigation = page.locator("aside").first();

  if (width < 1280) {
    await expect(menuButton).toBeVisible();
    await expect(desktopNavigation).toBeHidden();
  } else {
    await expect(menuButton).toBeHidden();
    await expect(desktopNavigation).toBeVisible();
  }
}

test.describe.configure({ mode: "serial" });

test("all admin workspaces fit tablet portrait and landscape", async ({ page }) => {
  test.setTimeout(240_000);
  await signIn(page, "admin@demo.local", "/admin");
  for (const viewport of tabletViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of routes) {
      await test.step(`${viewport.name}: ${route}`, async () => {
        await page.goto(route);
        await expect(page.locator("main.min-w-0")).toBeVisible();
        await expect(page).not.toHaveURL(/\/auth\/error/);
        await expect(page.locator("main.min-w-0 h1").first()).toBeVisible();
        await expectAdminShellMatchesViewport(page);
        await expectNoViewportOverflow(page, route);
      });
    }
  }
});

test("world cards keep readable controls on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await signIn(page, "admin@demo.local", "/admin/worlds");

  const cards = page.locator('[role="article"][aria-label^="Chủ đề nhiệm vụ:"]');
  await expect(cards.first()).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(cards.first()).toBeVisible();
  const first = cards.first();
  const controlWidths = await first.locator("input, select, textarea").evaluateAll((controls) =>
    controls
      .map((control) => {
        const rect = control.getBoundingClientRect();
        const style = window.getComputedStyle(control);
        return rect.width > 20 && rect.height > 20 && style.visibility !== "hidden"
          ? Math.round(rect.width)
          : null;
      })
      .filter((width): width is number => width !== null),
  );

  expect(Math.min(...controlWidths)).toBeGreaterThanOrEqual(180);

  const statusBox = await first.locator('select[name="status"]').boundingBox();
  const detailsBox = await first.locator("details").first().boundingBox();
  expect(statusBox).not.toBeNull();
  expect(detailsBox).not.toBeNull();
  const gapBeforeAdvancedSettings = detailsBox!.y - (statusBox!.y + statusBox!.height);
  expect(gapBeforeAdvancedSettings).toBeGreaterThanOrEqual(0);
  expect(gapBeforeAdvancedSettings).toBeLessThanOrEqual(20);

  await page.screenshot({
    path: ".verification/browser/admin-tablet-worlds.png",
    fullPage: true,
  });
});

test("media upload form fits tablet landscape", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 });
  await signIn(page, "admin@demo.local", "/admin/media");

  await expect(page.getByRole("heading", { name: "Hình ảnh, âm thanh và video" })).toBeVisible();
  await expectNoViewportOverflow(page, "/admin/media");
  await page.screenshot({
    path: ".verification/browser/admin-tablet-media.png",
    fullPage: true,
  });
});
