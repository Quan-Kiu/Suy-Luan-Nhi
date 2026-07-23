import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn } from "./helpers";

test.use({ viewport: { width: 320, height: 568 } });

test("Vietnamese profile name stays separated from the mission-map label", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);

  await apiData(
    await page.request.patch(`/api/children/${child.id}`, {
      data: { displayName: "Ếch" },
    }),
  );
  await selectChild(page, child.id);
  await page.goto("/missions");

  const intro = page.getByTestId("mission-map-intro");
  const label = page.getByTestId("mission-map-profile-label");
  const name = page.getByTestId("mission-map-profile-name");

  await expect(intro).toBeVisible();
  await expect(name).toHaveText("Ếch");

  const [introBox, labelBox, nameBox] = await Promise.all([
    intro.boundingBox(),
    label.boundingBox(),
    name.boundingBox(),
  ]);
  expect(introBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(nameBox).not.toBeNull();

  const verticalGap = nameBox!.y - (labelBox!.y + labelBox!.height);
  expect(verticalGap).toBeGreaterThanOrEqual(7);
  expect(nameBox!.x).toBeGreaterThanOrEqual(introBox!.x);
  expect(nameBox!.x + nameBox!.width).toBeLessThanOrEqual(introBox!.x + introBox!.width + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
