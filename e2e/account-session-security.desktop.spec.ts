import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("a parent reviews and revokes another browser session", async ({ browser }) => {
  const primaryContext = await browser.newContext();
  const secondaryContext = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  });
  const primaryPage = await primaryContext.newPage();
  const secondaryPage = await secondaryContext.newPage();

  try {
    await signIn(primaryPage, "parent@demo.local");
    const child = await getDemoChild(primaryPage);
    await selectChild(primaryPage, child.id);
    await unlockParentGate(primaryPage);

    await signIn(secondaryPage, "parent@demo.local");
    await primaryPage.goto("/parent/settings");

    const sessions = primaryPage.locator("[data-account-session]");
    await expect.poll(() => sessions.count()).toBeGreaterThanOrEqual(2);
    await expect(primaryPage.locator('[data-account-session][data-current="true"]')).toHaveCount(1);
    const secondarySession = primaryPage.getByLabel("Safari trên iOS");
    await expect(secondarySession).toBeVisible();

    await secondarySession.getByRole("button", { name: "Đăng xuất" }).click();
    await primaryPage.getByRole("alertdialog").getByRole("button", { name: "Đăng xuất thiết bị" }).click();

    await expect(primaryPage.getByLabel("Safari trên iOS")).toHaveCount(0);
    await expect(primaryPage.getByText("Đã đăng xuất thiết bị", { exact: true })).toBeVisible();
    const revokedResponse = await secondaryPage.request.get("/api/children");
    expect(revokedResponse.status()).toBe(401);
  } finally {
    await secondaryContext.close();
    await primaryContext.close();
  }
});
