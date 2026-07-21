import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn } from "./helpers";

test("child mission map reuses cached data and keeps its header visible", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  let missionMapRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === `/api/children/${child.id}/mission-map`) {
      missionMapRequests += 1;
    }
  });

  await page.goto("/missions");
  await expect(page.getByRole("heading", { name: child.displayName })).toBeVisible();
  await expect(page.locator("[data-mission-card]").first()).toBeVisible();
  expect(missionMapRequests).toBe(1);

  await page.locator('a[href^="/missions/"]').first().click();
  await expect(page).toHaveURL(/\/missions\/.+/);
  await page.getByLabel("Quay lại").click();
  await expect(page).toHaveURL(/\/missions$/);
  await expect(page.locator("[data-mission-card]").first()).toBeVisible();
  expect(missionMapRequests).toBe(1);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const header = page.getByTestId("child-header");
  await expect(header).toBeInViewport();
  await expect.poll(async () => (await header.boundingBox())?.y ?? 999).toBeLessThanOrEqual(1);
});
