import { expect, test } from "@playwright/test";
import { clearAuth, signIn } from "./helpers";

test.describe.configure({ mode: "serial" });

test("super admin sees the renamed library and dictionary navigation", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/content-variables");

  await expect(page.getByRole("heading", { name: "Từ điển", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Thư viện", exact: true })).toHaveAttribute(
    "href",
    "/admin/media",
  );
  await expect(page.getByRole("link", { name: "Từ điển", exact: true })).toHaveAttribute(
    "href",
    "/admin/content-variables",
  );
  await expect(page.getByRole("link", { name: "Thông tin từ điển", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Thông tin tự điền", exact: true })).toHaveCount(0);
});

test("super admin manages content tags from a dedicated dashboard", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/content-variables");

  await expect(page.getByRole("heading", { name: "Từ điển", exact: true })).toBeVisible();
  await expect(page.getByText("Chỉ dành cho Super Admin", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Từ điển" })).toBeVisible();
  await expect(page.getByText("{{name}}", { exact: true }).first()).toBeVisible();
  await expect(page.getByPlaceholder("name").first()).toBeDisabled();
  await page.getByRole("button", { name: "Thêm tag mới" }).click();
  await expect(page.getByRole("button", { name: "Bỏ tag mới" })).toBeVisible();
  await page.getByRole("button", { name: "Bỏ tag mới" }).click();

  await page.getByLabel("Nội dung thử").fill("Yêu cầu {{name}} quan sát thật kỹ.");
  await expect(page.getByText("Yêu cầu Bống quan sát thật kỹ.", { exact: true })).toBeVisible();

  const saveResponse = page.waitForResponse(
    (response) => response.url().endsWith("/api/admin/settings") && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Lưu cấu hình tag" }).click();
  expect((await saveResponse).status()).toBe(200);
  await expect(page.getByText("Đã lưu cấu hình tag nội dung")).toBeVisible();

  const invalid = await page.request.patch("/api/admin/settings", {
    data: {
      key: "content.template_variables",
      value: [
        {
          key: "Name Has Spaces",
          label: "Tag lỗi",
          description: "Cấu hình này phải bị từ chối",
          source: "child.displayName",
          example: "Bống",
          fallback: "bé",
          enabled: true,
        },
      ],
    },
  });
  expect(invalid.status()).toBe(400);
});

test("mission author gets tag suggestions while writing", async ({ page }) => {
  await clearAuth(page);
  await signIn(page, "content@demo.local", "/admin/missions/new");

  await expect(page.getByRole("link", { name: "Từ điển" })).toHaveCount(0);
  const prompt = page.getByLabel("Câu hỏi dành cho bé");
  await prompt.fill("Yêu cầu {{");

  const nameSuggestion = page.getByRole("button", { name: /Tên bé/ });
  await expect(nameSuggestion).toBeVisible();
  await expect(page.getByRole("button", { name: /Hạng hiện tại/ })).toHaveCount(0);
  await nameSuggestion.click();
  await expect(prompt).toHaveValue("Yêu cầu {{name}}");
  await expect(page.getByRole("heading", { name: "Yêu cầu Bống" })).toBeVisible();

  const firstOption = page.getByRole("textbox", { name: "Các lựa chọn 1" });
  await firstOption.fill("{{");
  await page.getByRole("button", { name: /Tên bé/ }).click();
  await expect(firstOption).toHaveValue("{{name}}");
  await expect(page.getByRole("button", { name: "Bống" })).toBeVisible();

  await page.goto("/admin/content-variables");
  await expect(page).toHaveURL(/\/auth\/error\?reason=forbidden/);
});
