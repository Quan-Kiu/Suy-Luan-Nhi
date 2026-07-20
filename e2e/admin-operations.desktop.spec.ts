import { expect, test } from "@playwright/test";
import { apiData, clearAuth, signIn } from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4S8AAAAASUVORK5CYII=",
  "base64",
);

test.describe.configure({ mode: "serial" });

test("admin uses plain-language navigation and a structured mission editor", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");
  await expect(page.getByRole("heading", { name: "Hôm nay cần làm gì?" })).toBeVisible();
  await expect(page.getByText("Biên tập nội dung", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Thành viên & quyền" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Cấu hình hệ thống" })).toHaveCount(0);

  await page.getByRole("link", { name: "Tạo nhiệm vụ mới" }).first().click();
  await expect(page.getByRole("heading", { name: "Nhiệm vụ chưa đặt tên" })).toBeVisible();
  await expect(page.getByText("Payload JSON")).toHaveCount(0);
  await expect(page.getByText("Đáp án đúng JSON")).toHaveCount(0);
  await expect(page.getByRole("group", { name: "Các lựa chọn" })).toBeVisible();

  await page.getByPlaceholder("Ví dụ: Thám tử dấu chân").fill("Nhiệm vụ UX dễ hiểu");
  await page.getByText("Thiết lập nâng cao").first().click();
  await expect(page.getByPlaceholder("tham-tu-dau-chan")).toHaveValue("nhiem-vu-ux-de-hieu");
});

test("admin actions and protected pages match the signed-in role", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin");
  await expect(page.getByRole("link", { name: /bản nháp đang soạn/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Duyệt nội dung" })).toHaveCount(0);
  await page.goto("/admin/reviews");
  await expect(page).toHaveURL(/\/auth\/error\?reason=forbidden/);

  await clearAuth(page);
  await signIn(page, "reviewer@demo.local", "/admin");
  await expect(page.getByText("Người kiểm duyệt", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Duyệt nội dung" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tạo nhiệm vụ mới" })).toHaveCount(0);

  await page.goto("/admin/missions");
  await expect(page.getByRole("button", { name: "Nhân bản nhiệm vụ" })).toHaveCount(0);
  await page.goto("/admin/missions/new");
  await expect(page).toHaveURL(/\/auth\/error\?reason=forbidden/);
});

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
  await expect(page.getByRole("heading", { name: "Chủ đề nhiệm vụ", exact: true })).toBeVisible();

  const newWorld = page.locator("article").filter({ hasText: "Thêm chủ đề nhiệm vụ" });
  await newWorld.getByPlaceholder("Ví dụ: Thám tử Quy luật").fill("Thế giới E2E");
  await newWorld.getByPlaceholder("Ví dụ: Quan sát thật tinh").fill("Kiểm thử vận hành");
  await newWorld
    .getByPlaceholder("Giới thiệu trẻ sẽ khám phá điều gì trong thế giới này")
    .fill("Thế giới được tạo từ browser test thực tế.");
  await newWorld.getByText("Thiết lập nâng cao").click();
  await newWorld.locator('input[type="file"]').setInputFiles({
    name: "world-cover.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await expect(newWorld.getByText(/URL đã được lấy tự động/)).toBeVisible();
  await newWorld.getByRole("button", { name: "Thêm chủ đề" }).click();
  await expect(page.getByText("Đã thêm chủ đề nhiệm vụ")).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "Chủ đề nhiệm vụ: Thế giới E2E" })
      .getByPlaceholder("Ví dụ: Thám tử Quy luật"),
  ).toHaveValue("Thế giới E2E");

  await page.goto("/admin/taxonomy");
  const newSkill = page.getByRole("region", { name: "Thêm kỹ năng hoặc thói quen" });
  await newSkill.getByPlaceholder("Ví dụ: Quan sát kỹ").fill("Tư duy E2E");
  await newSkill
    .getByPlaceholder("Ví dụ: Bé chú ý đến chi tiết và nhận ra tín hiệu quan trọng.")
    .fill("Kỹ năng được tạo tự động để xác nhận luồng quản trị dễ hiểu.");
  await newSkill.getByLabel("Nhóm kỹ năng").selectOption("thinking");
  await newSkill.getByText("Thiết lập nâng cao").click();
  await expect(newSkill.getByLabel("Mã nội bộ")).toHaveValue("tu-duy-e2e");
  await newSkill.getByRole("button", { name: "Thêm kỹ năng" }).click();
  await expect(page.getByText("Đã thêm kỹ năng")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Kỹ năng: Tư duy E2E" }).getByPlaceholder("Ví dụ: Quan sát kỹ"),
  ).toHaveValue("Tư duy E2E");
});
test("media follows upload, reviewer approval and owner deletion permissions", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/media");
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-pixel.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByPlaceholder("Mô tả hình ảnh hoặc âm thanh").fill("Điểm ảnh dùng cho kiểm thử media");
  await page.getByRole("button", { name: "Tải lên" }).click();
  await expect(page.getByText("Đã tải tư liệu lên thư viện")).toBeVisible();
  const uploadedCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  await expect(uploadedCard).toContainText("Chờ kiểm tra");
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
  await reviewCard.getByLabel("Duyệt tư liệu").click();
  await expect(reviewCard).toContainText("Đã duyệt");
  await expect(reviewCard.getByLabel("Xóa tư liệu")).toHaveCount(0);

  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin/media");
  const deleteCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  await deleteCard.getByLabel("Xóa tư liệu").click();
  const deleteDialog = page.getByRole("alertdialog", { name: "Xóa tư liệu?" });
  await deleteDialog.getByRole("button", { name: "Xóa tư liệu" }).click();
  await expect(deleteCard).toHaveCount(0);
  expect((await page.request.get(mediaUrl!)).status()).toBe(404);
});
test("resource editor creates technical URLs without asking ordinary editors to type them", async ({
  page,
}) => {
  await signIn(page, "content@demo.local", "/admin/resources/new");
  await expect(page.getByRole("heading", { name: "Viết nội dung cho phụ huynh" })).toBeVisible();
  await page.getByPlaceholder("Ví dụ: Cùng con luyện cách quan sát").fill("Cùng con quan sát mỗi ngày");
  const slug = page.locator('input[name="slug"]');
  await expect(slug).toBeHidden();
  await page.getByText("Thiết lập nâng cao").click();
  await expect(slug).toHaveValue("cung-con-quan-sat-moi-ngay");
});

test("super admin changes common settings without editing raw JSON", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/settings");
  await expect(page.getByRole("heading", { name: "Cấu hình hệ thống" })).toBeVisible();
  await expect(page.getByText("Kiểm tra tác động trước khi lưu")).toBeVisible();

  const create = page.locator("form").filter({ hasText: "Thêm cấu hình mới" });
  await create.getByLabel("Dạng cấu hình").selectOption("boolean");
  await create.getByText("Thiết lập nâng cao").click();
  await create.getByLabel("Mã cấu hình").fill("features.e2e-enabled");
  await expect(create.getByLabel("Bật ngay sau khi tạo")).toBeChecked();
  await create.getByRole("button", { name: "Thêm cấu hình" }).click();
  await expect(page.getByText("Đã thêm cấu hình hệ thống")).toBeVisible();

  const setting = page.locator("article").filter({ hasText: "Features e2e enabled" });
  await expect(setting).toBeVisible();
  await expect(setting.getByText("features.e2e-enabled")).toBeHidden();
  await setting.getByText("Thông tin dành cho đội kỹ thuật").click();
  await expect(setting.getByText("features.e2e-enabled")).toBeVisible();
  await setting.getByLabel("Bật thiết lập này").uncheck();
  await setting.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã lưu cấu hình hệ thống")).toBeVisible();

  const response = await page.request.patch("/api/admin/settings", {
    data: { key: "features.e2e-enabled", value: true },
  });
  const data = await apiData<{ key: string; value: boolean }>(response);
  expect(data).toMatchObject({ key: "features.e2e-enabled", value: true });
});
