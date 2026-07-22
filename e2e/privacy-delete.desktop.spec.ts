import { expect, test } from "@playwright/test";
import { apiData, clearAuth, demoPassword, signIn, unlockParentGate } from "./helpers";

const email = "privacy@demo.local";
const password = demoPassword;

test("family deletion request is parent-gated and super-admin anonymizes the account", async ({ page }) => {
  await signIn(page, email);
  await expect(page).toHaveURL(/\/profiles$/);

  const child = await apiData<{ id: string }>(
    await page.request.post("/api/children", {
      data: { displayName: "Bé Xóa E2E", ageGroup: "6-8" },
    }),
  );
  await apiData(await page.request.post(`/api/children/${child.id}/select`));

  const blocked = await page.request.post("/api/parent/delete-data-request");
  const blockedBody = await blocked.json();
  expect(blocked.status()).toBe(403);
  expect(blockedBody).toMatchObject({
    success: false,
    error: { message: /Parent Gate/ },
  });
  await unlockParentGate(page);
  await expect(page.getByRole("heading", { name: /Tuần này của Bé Xóa E2E/i })).toBeVisible();

  const request = await apiData<{ id: string; status: string }>(
    await page.request.post("/api/parent/delete-data-request"),
  );
  expect(request.status).toBe("pending");

  await clearAuth(page);
  await signIn(page, "admin@demo.local", "/admin/data-requests");
  const row = page.locator("tr").filter({ hasText: email });
  await expect(row).toContainText("Đang chờ xử lý");
  await row.getByRole("button", { name: "Xử lý xóa" }).click();
  await page
    .getByRole("alertdialog", { name: "Xóa dữ liệu gia đình?" })
    .getByRole("button", { name: "Xác nhận xóa dữ liệu" })
    .click();
  const completedRow = page.locator("tr").filter({ hasText: "Đã xóa" });
  await expect(completedRow).toContainText("Đã hoàn thành");

  await clearAuth(page);
  const loginResponse = await page.request.post("/api/auth/sign-in/email", {
    headers: { origin: "http://127.0.0.1:3100" },
    data: { email, password, rememberMe: false },
  });
  expect(loginResponse.status()).toBeGreaterThanOrEqual(400);
});
