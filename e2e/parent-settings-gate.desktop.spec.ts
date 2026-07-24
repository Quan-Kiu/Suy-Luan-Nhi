import { expect, test } from "@playwright/test";
import { getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test("routine parent settings still save after the Parent Gate expires", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await page.goto("/parent/settings");

  await page.context().clearCookies({ name: "sln_parent_gate" });
  await page.getByLabel("Tự động gửi báo cáo lỗi").click();

  const responsePromise = page.waitForResponse(
    (response) => response.url().endsWith("/api/parent/settings") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  await expect(page.getByText("Đã lưu cài đặt", { exact: true })).toBeVisible();
});
