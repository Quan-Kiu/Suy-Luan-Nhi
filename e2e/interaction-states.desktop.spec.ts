import { expect, test } from "@playwright/test";
import { demoPassword } from "./helpers";

test.describe("interaction state regressions", () => {
  test("uses the correct cursor for enabled, disabled, and busy controls", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.evaluate(() => {
      const fixture = document.createElement("div");
      fixture.innerHTML = `
        <button id="cursor-enabled" type="button">Enabled</button>
        <button id="cursor-disabled" type="button" disabled>Disabled</button>
        <button id="cursor-busy" type="button" disabled aria-busy="true">Busy</button>
      `;
      document.body.append(fixture);
    });

    await expect(page.locator("#cursor-enabled")).toHaveCSS("cursor", "pointer");
    await expect(page.locator("#cursor-disabled")).toHaveCSS("cursor", "not-allowed");
    await expect(page.locator("#cursor-busy")).toHaveCSS("cursor", "progress");
  });

  test("keeps sign-in pending until a slow destination route commits", async ({ page }) => {
    await page.goto("/auth/sign-in?callbackUrl=%2Fprofiles");
    await page.getByLabel("Email").fill("parent@demo.local");
    await page.locator('input[name="password"]').fill(demoPassword);

    let routeStartedAt = 0;
    let releaseRoute: (() => void) | undefined;
    const routeStarted = new Promise<void>((resolveStarted) => {
      void page.route("**/auth/setup-pin**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === "/auth/setup-pin") {
          routeStartedAt = Date.now();
          resolveStarted();
          await new Promise<void>((resolveRelease) => {
            releaseRoute = resolveRelease;
          });
        }
        await route.continue();
      });
    });

    const submit = page.locator('button[type="submit"]');
    await submit.click();
    await routeStarted;

    expect(routeStartedAt).toBeGreaterThan(0);
    const pendingState = await submit.evaluate((button) => ({
      disabled: button.disabled,
      busy: button.getAttribute("aria-busy"),
      text: button.textContent ?? "",
      cursor: getComputedStyle(button).cursor,
    }));
    expect(pendingState).toMatchObject({
      disabled: true,
      busy: "true",
      cursor: "progress",
    });
    expect(pendingState.text).toContain("Đang đăng nhập");

    releaseRoute?.();
    await page.waitForURL(/\/auth\/setup-pin/);
  });
});
