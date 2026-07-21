import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("success feedback remains prominent on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 539, height: 620 });
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);

  await page.goto("/parent/settings");
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();

  const toast = page
    .locator('[data-sonner-toast][data-type="success"]')
    .filter({ hasText: "Đã lưu cài đặt" });
  await expect(toast).toBeVisible();

  const presentation = await toast.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const icon = element.querySelector<HTMLElement>("[data-icon]");
    const close = element.querySelector<HTMLElement>("[data-close-button]");
    const title = element.querySelector<HTMLElement>("[data-title]");
    return {
      width: rect.width,
      height: rect.height,
      borderWidth: Number.parseFloat(style.borderTopWidth),
      borderColor: style.borderTopColor,
      backgroundImage: style.backgroundImage,
      boxShadow: style.boxShadow,
      titleWeight: Number.parseInt(window.getComputedStyle(title!).fontWeight, 10),
      iconSize: icon?.getBoundingClientRect().width ?? 0,
      iconBackground: icon ? window.getComputedStyle(icon).backgroundColor : "",
      closeVisible: close ? window.getComputedStyle(close).display !== "none" : false,
    };
  });

  expect(presentation.width).toBeGreaterThan(480);
  expect(presentation.height).toBeGreaterThanOrEqual(70);
  expect(presentation.borderWidth).toBeGreaterThanOrEqual(2);
  expect(presentation.borderColor).toBe("rgb(63, 153, 96)");
  expect(presentation.backgroundImage).not.toBe("none");
  expect(presentation.boxShadow).not.toBe("none");
  expect(presentation.titleWeight).toBeGreaterThanOrEqual(800);
  expect(presentation.iconSize).toBeGreaterThanOrEqual(34);
  expect(presentation.iconBackground).toBe("rgb(21, 128, 61)");
  expect(presentation.closeVisible).toBe(true);

  await page.screenshot({ path: ".verification/toast-feedback-539.png", fullPage: false });
});
