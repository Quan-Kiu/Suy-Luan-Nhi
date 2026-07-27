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
    await page.getByRole("textbox", { name: "Mật khẩu", exact: true }).fill(demoPassword);

    const snapshots: Array<{
      at: number;
      disabled: boolean;
      busy: string | null;
      text: string;
      cursor: string;
    }> = [];
    await page.exposeFunction("captureSignInState", (snapshot: Omit<(typeof snapshots)[number], "at">) =>
      snapshots.push({ ...snapshot, at: Date.now() }),
    );
    await page.evaluate(() => {
      const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
      const capture = (
        window as typeof window & {
          captureSignInState: (snapshot: {
            disabled: boolean;
            busy: string | null;
            text: string;
            cursor: string;
          }) => Promise<void>;
        }
      ).captureSignInState;
      window.setInterval(() => {
        if (!button?.isConnected) return;
        void capture({
          disabled: button.disabled,
          busy: button.getAttribute("aria-busy"),
          text: button.textContent ?? "",
          cursor: getComputedStyle(button).cursor,
        });
      }, 40);
    });

    let routeStartedAt = 0;
    await page.route("**/auth/setup-pin**", async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/auth/setup-pin") {
        routeStartedAt = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 1_200));
      }
      await route.continue();
    });

    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await page.waitForURL(/\/profiles$/);

    expect(routeStartedAt).toBeGreaterThan(0);
    expect(
      snapshots.some(
        (snapshot) =>
          snapshot.at >= routeStartedAt &&
          snapshot.disabled &&
          snapshot.busy === "true" &&
          snapshot.text.includes("Đang đăng nhập") &&
          snapshot.cursor === "progress",
      ),
    ).toBe(true);
  });
});
