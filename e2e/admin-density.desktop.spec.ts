import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test.describe.configure({ mode: "serial" });

test("admin workspace keeps navigation scrollable and repeated records compact", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page, "admin@demo.local", "/admin/content-variables");

  const shell = page.locator("[data-admin-shell]");
  const sidebar = shell.locator("aside").last();
  const main = page.locator("#admin-main-content");
  await expect(shell).toBeVisible();
  await expect(sidebar).toBeVisible();
  await expect(main).toBeVisible();
  for (const width of [1280, 1440, 1600]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await shell.evaluate((element) => element.scrollWidth <= element.clientWidth),
      `admin shell should not overflow horizontally at ${width}px`,
    ).toBe(true);
  }
  expect(await sidebar.evaluate((element) => getComputedStyle(element).overflowY)).toBe("auto");
  expect(await main.evaluate((element) => getComputedStyle(element).overflowY)).toBe("auto");

  const variable = page.locator("form details").first();
  await expect(variable).not.toHaveAttribute("open", "");
  const variableSummary = variable.locator("summary");
  const variableBox = await variableSummary.boundingBox();
  expect(variableBox?.height).toBeLessThanOrEqual(80);
  await variableSummary.click();
  await expect(variable.getByLabel("Tên tag")).toBeVisible();

  await page.screenshot({
    path: ".verification/browser/admin-density-content-variables.png",
    fullPage: false,
  });
});

test("world and badge records use summaries before full edit forms", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await signIn(page, "admin@demo.local", "/admin/worlds");

  const world = page.getByRole("article", { name: /Chủ đề nhiệm vụ:/ }).first();
  await expect(world).toBeVisible();
  const worldSummary = world.locator(":scope > summary");
  const worldBox = await worldSummary.boundingBox();
  expect(worldBox?.height).toBeLessThanOrEqual(110);
  await worldSummary.click();
  await expect(world.getByLabel("Tên chủ đề")).toBeVisible();

  await page.goto("/admin/badges");
  const badge = page.getByRole("article", { name: /Huy hiệu:/ }).first();
  await expect(badge).toBeVisible();
  const badgeSummary = badge.locator(":scope > summary");
  const badgeBox = await badgeSummary.boundingBox();
  expect(badgeBox?.height).toBeLessThanOrEqual(96);
  const badgeImage = badgeSummary.locator("img");
  if (await badgeImage.count()) {
    expect(await badgeImage.evaluate((image) => getComputedStyle(image).objectFit)).toBe("contain");
  }

  await page.screenshot({
    path: ".verification/browser/admin-density-worlds-badges.png",
    fullPage: false,
  });
});
