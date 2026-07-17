import { expect, test } from "@playwright/test";
import { apiData, clearAuth, signIn } from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4S8AAAAASUVORK5CYII=",
  "base64",
);

test.describe.configure({ mode: "serial" });

test("health endpoints report liveness and database readiness", async ({ page }) => {
  const live = await apiData<{ status: string; service: string }>(await page.request.get("/api/health/live"));
  expect(live).toEqual(expect.objectContaining({ status: "ok", service: "sln-gpt" }));

  const ready = await apiData<{ status: string; database: string }>(
    await page.request.get("/api/health/ready"),
  );
  expect(ready).toEqual(expect.objectContaining({ status: "ready", database: "ok" }));
});

test("parent is denied admin UI and mutations with the shared error envelope", async ({ page }) => {
  await signIn(page, "parent@demo.local", "/admin");
  await expect(page).toHaveURL(/\/auth\/error\?reason=forbidden/);

  const response = await page.request.post("/api/admin/worlds", {
    data: {
      slug: "forbidden-world",
      title: "Forbidden World",
      subtitle: "Should not exist",
      description: "This request must be denied by RBAC.",
      sortOrder: 99,
      themeColor: "green",
      coverUrl: "/assets/cards/world-card-detective-rules.png",
    },
  });
  const body = await response.json();
  expect(response.status()).toBe(403);
  expect(body).toMatchObject({ success: false, error: { code: "FORBIDDEN" } });
});
test("content admin creates taxonomy and world content through the CMS", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/worlds");
  await expect(page.getByRole("heading", { name: "Mission Worlds", exact: true })).toBeVisible();

  const newWorld = page.locator("article").filter({ hasText: "Tạo Mission World mới" });
  await newWorld.getByPlaceholder("slug").fill("e2e-world");
  await newWorld.getByPlaceholder("Tiêu đề").fill("Thế giới E2E");
  await newWorld.getByPlaceholder("Phụ đề").fill("Kiểm thử vận hành");
  await newWorld.getByPlaceholder("Cover URL").fill("/assets/cards/world-card-detective-rules.png");
  await newWorld.getByPlaceholder("Mô tả").fill("Thế giới được tạo từ browser test thực tế.");
  await newWorld.getByRole("button", { name: "Tạo thế giới" }).click();
  await expect(page.getByText("Đã tạo Mission World")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Mission World: Thế giới E2E" }).getByPlaceholder("Tiêu đề"),
  ).toHaveValue("Thế giới E2E");

  await page.goto("/admin/taxonomy");
  const newSkill = page.getByRole("region", { name: "Tạo kỹ năng mới" });
  await newSkill.getByPlaceholder("slug").fill("e2e-thinking");
  await newSkill.getByPlaceholder("Tên kỹ năng").fill("Tư duy E2E");
  await newSkill.getByPlaceholder("Mô tả").fill("Kỹ năng được tạo tự động để xác nhận CRUD taxonomy.");
  await newSkill.getByPlaceholder("category").fill("thinking");
  await newSkill.getByRole("button", { name: "Tạo" }).click();
  await expect(page.getByText("Đã tạo kỹ năng")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Kỹ năng: Tư duy E2E" }).getByPlaceholder("Tên kỹ năng"),
  ).toHaveValue("Tư duy E2E");
});
test("media follows upload, reviewer approval and owner deletion permissions", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/media");
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-pixel.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByPlaceholder("Mô tả hình ảnh hoặc audio").fill("Điểm ảnh dùng cho kiểm thử media");
  await page.getByRole("button", { name: "Tải lên" }).click();
  await expect(page.getByText("Đã tải media lên storage")).toBeVisible();
  const uploadedCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  await expect(uploadedCard).toContainText("pending");
  const mediaUrl = (await uploadedCard.locator("code").textContent())?.trim();
  expect(mediaUrl).toMatch(/^\/uploads\/e2e\/image\//);
  const mediaResponse = await page.request.get(mediaUrl!);
  expect(mediaResponse.status()).toBe(200);
  expect(mediaResponse.headers()["content-type"]).toBe("image/png");
  if (process.env.E2E_SERVER_MODE === "production") {
    expect(mediaResponse.headers()["cache-control"]).toContain("immutable");
  } else {
    expect(mediaResponse.headers()["cache-control"]).toBeTruthy();
  }
  expect((await mediaResponse.body()).byteLength).toBeGreaterThan(0);

  await clearAuth(page);
  await signIn(page, "reviewer@demo.local", "/admin/media");
  const reviewCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  await reviewCard.getByLabel("Duyệt media").click();
  await expect(reviewCard).toContainText("approved");
  await expect(reviewCard.getByLabel("Xóa media")).toHaveCount(0);

  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin/media");
  const deleteCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  page.once("dialog", (dialog) => dialog.accept());
  await deleteCard.getByLabel("Xóa media").click();
  await expect(deleteCard).toHaveCount(0);
  expect((await page.request.get(mediaUrl!)).status()).toBe(404);
});
test("super admin persists system settings and receives audit-safe responses", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/settings");
  await page.getByPlaceholder("key.ví_dụ").fill("e2e.feature.enabled");
  await page.locator("textarea").last().fill('{"enabled":true,"source":"browser-test"}');
  await page.getByRole("button", { name: "Thêm setting" }).click();
  await expect(page.getByText("Đã lưu system setting")).toBeVisible();
  await expect(page.getByText("e2e.feature.enabled")).toBeVisible();

  const response = await page.request.patch("/api/admin/settings", {
    data: { key: "e2e.feature.enabled", value: { enabled: false } },
  });
  const data = await apiData<{ key: string; value: { enabled: boolean } }>(response);
  expect(data).toMatchObject({ key: "e2e.feature.enabled", value: { enabled: false } });
});
