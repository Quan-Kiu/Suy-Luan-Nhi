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
  await expect(page.getByRole("link", { name: "Tài khoản quản trị" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Cài đặt nâng cao" })).toHaveCount(0);

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
  await expect(page.getByRole("link", { name: /bản nháp cần làm tiếp/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nội dung chờ kiểm tra" })).toHaveCount(0);
  await page.goto("/admin/reviews");
  await expect(page).toHaveURL(/\/auth\/error\?reason=forbidden/);

  await clearAuth(page);
  await signIn(page, "reviewer@demo.local", "/admin");
  await expect(page.getByText("Người kiểm tra nội dung", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nội dung chờ kiểm tra" })).toBeVisible();
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
  await expect(newWorld.getByText(/Tệp đã được gắn tự động vào nội dung/)).toBeVisible();
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
  await newSkill.getByLabel("Loại kỹ năng").selectOption("thinking");
  await newSkill.getByText("Thiết lập nâng cao").click();
  await expect(newSkill.getByLabel("Mã nội bộ")).toHaveValue("tu-duy-e2e");
  await newSkill.getByRole("button", { name: "Thêm kỹ năng" }).click();
  await expect(page.getByText("Đã thêm kỹ năng")).toBeVisible();
  await expect(
    page.getByRole("article", { name: "Kỹ năng: Tư duy E2E" }).getByPlaceholder("Ví dụ: Quan sát kỹ"),
  ).toHaveValue("Tư duy E2E");

  await page.goto("/admin/badges");
  await expect(page.getByRole("heading", { name: "Huy hiệu", exact: true })).toBeVisible();
  const newBadge = page.getByRole("region", { name: "Thêm huy hiệu mới" });
  await newBadge.getByPlaceholder("Ví dụ: Người bạn Khu phố Xanh").fill("Huy hiệu E2E");
  await newBadge
    .getByPlaceholder("Giải thích bé nhận huy hiệu khi hoàn thành điều gì.")
    .fill("Huy hiệu dùng để kiểm tra luồng quản lý phần thưởng.");
  await newBadge.locator('input[type="file"]').setInputFiles({
    name: "badge-e2e.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await expect(newBadge.getByText(/Tệp đã được gắn tự động vào nội dung/)).toBeVisible();
  await newBadge.getByRole("button", { name: "Thêm huy hiệu" }).click();
  await expect(page.getByText("Đã thêm huy hiệu")).toBeVisible();
  const badgeCard = page.getByRole("article", { name: "Huy hiệu: Huy hiệu E2E" });
  await expect(badgeCard).toBeVisible();

  await page.goto("/admin/missions/new");
  await expect(
    page
      .getByRole("combobox", { name: /Huy hiệu nhận được|Phần thưởng/ })
      .getByRole("option", { name: "Huy hiệu E2E" }),
  ).toHaveCount(1);

  await page.goto("/admin/badges");
  const editableBadge = page.getByRole("article", { name: "Huy hiệu: Huy hiệu E2E" });
  await editableBadge.getByLabel("Cho phép chọn huy hiệu này trong nhiệm vụ mới").uncheck();
  await editableBadge.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã cập nhật huy hiệu")).toBeVisible();

  await page.goto("/admin/missions/new");
  await expect(
    page
      .getByRole("combobox", { name: /Huy hiệu nhận được|Phần thưởng/ })
      .getByRole("option", { name: /Huy hiệu E2E/ }),
  ).toHaveCount(0);
});
test("media follows upload, reviewer approval and owner deletion permissions", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/media");
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-pixel.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByPlaceholder("Ví dụ: Bống cầm kính lúp bên cây").fill("Điểm ảnh dùng cho kiểm thử media");
  await page.getByRole("button", { name: "Chọn và tải lên" }).click();
  await expect(page.getByText("Đã thêm vào thư viện")).toBeVisible();
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
  await reviewCard.getByLabel("Đánh dấu phù hợp").click();
  await expect(reviewCard).toContainText("Đã kiểm tra");
  await expect(reviewCard.getByLabel("Xóa tệp")).toHaveCount(0);

  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin/media");
  const deleteCard = page.locator("article").filter({ hasText: "e2e-pixel.png" });
  await deleteCard.getByLabel("Xóa tệp").click();
  const deleteDialog = page.getByRole("alertdialog", { name: "Xóa tệp này?" });
  await deleteDialog.getByRole("button", { name: "Xóa tệp" }).click();
  await expect(deleteCard).toHaveCount(0);
  expect((await page.request.get(mediaUrl!)).status()).toBe(404);
});
test("resource editor creates technical URLs without asking ordinary editors to type them", async ({
  page,
}) => {
  await signIn(page, "content@demo.local", "/admin/resources/new");
  await expect(page.getByRole("heading", { name: "Viết bài cho phụ huynh" })).toBeVisible();
  await page.getByPlaceholder("Ví dụ: Cùng con luyện cách quan sát").fill("Cùng con quan sát mỗi ngày");
  const slug = page.locator('input[name="slug"]');
  await expect(slug).toBeHidden();
  await page.getByText("Thiết lập nâng cao").click();
  await expect(slug).toHaveValue("cung-con-quan-sat-moi-ngay");
});

test("super admin changes common settings without editing raw JSON", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/settings");
  await expect(page.getByRole("heading", { name: "Cài đặt nâng cao", exact: true })).toBeVisible();
  await expect(
    page.getByText("Chỉ thay đổi khi bạn hiểu rõ cài đặt này ảnh hưởng đến phần nào của hệ thống."),
  ).toBeVisible();

  const uploadPolicies = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Giới hạn tải ảnh theo từng nội dung" }),
  });
  await expect(uploadPolicies.getByRole("group")).toHaveCount(7);
  const missionCoverPolicy = uploadPolicies.getByRole("group", { name: "Ảnh bìa nhiệm vụ" });
  const maxSizeInput = missionCoverPolicy.getByLabel("Dung lượng tối đa (MB)");
  await expect(maxSizeInput).toHaveValue("5");
  await maxSizeInput.click();
  await maxSizeInput.press("Control+A");
  await maxSizeInput.press("4");
  await expect(maxSizeInput).toHaveValue("4");
  await missionCoverPolicy.getByLabel("Kiểm tra chiều rộng và chiều cao").check();
  await missionCoverPolicy.getByLabel("Rộng tối thiểu (px)").fill("800");
  await uploadPolicies.getByRole("button", { name: "Lưu giới hạn tải ảnh" }).click();
  await expect(page.getByText("Đã lưu giới hạn tải ảnh")).toBeVisible();
  const policies = await apiData<Record<string, { maxSizeMb: number; minWidth: number | null }>>(
    await page.request.get("/api/admin/media/policies"),
  );
  expect(policies["mission-cover"]).toMatchObject({ maxSizeMb: 4, minWidth: 800 });

  const create = page.locator("form").filter({ hasText: "Thêm cài đặt nâng cao" });
  await create.getByLabel("Dạng cài đặt").selectOption("boolean");
  await create.getByText("Thiết lập nâng cao").click();
  await create.getByLabel("Mã cài đặt").fill("features.e2e-enabled");
  await expect(create.getByLabel("Bật ngay sau khi tạo")).toBeChecked();
  await create.getByRole("button", { name: "Thêm cài đặt" }).click();
  await expect(page.getByText("Đã thêm cài đặt")).toBeVisible();

  const setting = page.locator("article").filter({ hasText: "Features e2e enabled" });
  await expect(setting).toBeVisible();
  await expect(setting.getByText("features.e2e-enabled")).toBeHidden();
  await setting.getByText("Thông tin dành cho đội kỹ thuật").click();
  await expect(setting.getByText("features.e2e-enabled")).toBeVisible();
  await setting.getByLabel("Bật thiết lập này").uncheck();
  await setting.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã lưu cài đặt")).toBeVisible();

  const response = await page.request.patch("/api/admin/settings", {
    data: { key: "features.e2e-enabled", value: true },
  });
  const data = await apiData<{ key: string; value: boolean }>(response);
  expect(data).toMatchObject({ key: "features.e2e-enabled", value: true });
});
