import { expect, test, type Page } from "@playwright/test";

const password = "LocalDemo-2026!";

async function signIn(page: Page, email: string, callbackUrl = "/profiles") {
  await page.goto(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-in"));
}

test.describe.configure({ mode: "serial" });

test("login accepts the browser origin and custom APIs use one envelope", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "ba.me@example.com");
  await expect(page.getByLabel("Mật khẩu")).toHaveAttribute("placeholder", "Nhập mật khẩu");

  await signIn(page, "parent@demo.local");
  await expect(page).toHaveURL(/\/profiles$/);

  const response = await page.request.get("/api/children");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body).toMatchObject({ success: true, data: expect.any(Array) });
  expect(body.meta.requestId).toBe(response.headers()["x-request-id"]);
});
test("cross-origin mutations are rejected with the shared error envelope", async ({ page }) => {
  const response = await page.request.post("/api/parent/delete-data-request", {
    headers: { origin: "https://attacker.example" },
  });
  const body = await response.json();

  expect(response.status()).toBe(403);
  expect(body).toMatchObject({
    success: false,
    error: { code: "INVALID_ORIGIN", message: "Cross-origin mutation is not allowed" },
  });
  expect(body.meta.requestId).toBeTruthy();
});

test("content admin can override UI copy from the database", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/content");
  await expect(page.getByRole("heading", { name: "Quản lý nội dung hệ thống" })).toBeVisible();

  const row = page.locator("article").filter({ hasText: "signIn.emailPlaceholder" });
  await expect(row).toBeVisible();
  await row.locator("textarea").fill('"email-e2e@example.com"');
  await row.getByRole("button", { name: "Lưu nội dung" }).click();
  await expect(page.getByText("Đã lưu auth.signIn.emailPlaceholder")).toBeVisible();

  const dashboardTitleRow = page.locator("article").filter({ hasText: "dashboard.title" });
  await expect(dashboardTitleRow).toBeVisible();
  await dashboardTitleRow.locator("textarea").fill('"Bảng điều hành E2E"');
  await dashboardTitleRow.getByRole("button", { name: "Lưu nội dung" }).click();
  await expect(page.getByText("Đã lưu admin.dashboard.title")).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Bảng điều hành E2E" })).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "email-e2e@example.com");
});
