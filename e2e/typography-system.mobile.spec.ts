import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

const evidenceDir = path.join(process.cwd(), ".verification/typography-system-refresh/mobile");

async function expectSize(locator: Locator, minimum: number, maximum: number) {
  await expect(locator).toBeVisible();
  const computed = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
    };
  });
  expect(computed.fontSize).toBeGreaterThanOrEqual(minimum);
  expect(computed.fontSize).toBeLessThanOrEqual(maximum);
  expect(computed.lineHeight).toBeGreaterThan(computed.fontSize);
}

async function expectNoUnreadablySmallText(page: Page) {
  const violations = await page.locator("body *").evaluateAll((elements) =>
    elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const hasOwnText = Array.from(element.childNodes).some(
        (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
      );
      if (!hasOwnText || rect.width === 0 || rect.height === 0) return [];
      const size = Number.parseFloat(window.getComputedStyle(element).fontSize);
      return size < 12
        ? [{ tag: element.tagName.toLowerCase(), text: element.textContent?.trim().slice(0, 80), size }]
        : [];
    }),
  );
  expect(violations).toEqual([]);
}

test("semantic typography remains readable on mobile", async ({ page }) => {
  await mkdir(evidenceDir, { recursive: true });

  await page.goto("/auth/sign-up");
  await expectSize(page.locator("h1.type-page-title"), 28, 36);
  await expectSize(page.getByLabel("Tên ba/mẹ"), 16, 16);
  await expectSize(page.getByRole("button", { name: /Tạo tài khoản ba mẹ/i }), 15, 15);
  await expectNoUnreadablySmallText(page);
  await page.screenshot({ path: path.join(evidenceDir, "auth-sign-up.png"), fullPage: true });

  await signIn(page, "admin@demo.local", "/admin/content-variables");
  await expectSize(page.locator("h1.type-page-title"), 28, 36);
  await expectSize(page.locator("h2.type-card-title").first(), 17, 18);
  await expectNoUnreadablySmallText(page);
  await page.screenshot({ path: path.join(evidenceDir, "admin-content-variables.png"), fullPage: true });

  await clearAuth(page);
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await expectSize(page.locator("h1.type-page-title").first(), 28, 36);
  await expectSize(page.locator("h2.type-section-title").first(), 20, 24);
  await expectNoUnreadablySmallText(page);
  await page.screenshot({ path: path.join(evidenceDir, "parent-dashboard.png"), fullPage: true });

  await page.goto("/missions");
  await expectSize(page.locator("h1.type-child-page-title").first(), 30, 40);
  await expectSize(page.locator("h2.type-child-section-title").first(), 22, 28);
  await expectSize(page.locator("h3.type-card-title").first(), 17, 18);
  await expectNoUnreadablySmallText(page);
  await page.screenshot({ path: path.join(evidenceDir, "child-mission-map.png"), fullPage: true });
});
