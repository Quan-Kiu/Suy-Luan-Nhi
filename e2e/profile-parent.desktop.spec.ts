import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.describe.configure({ mode: "serial" });

test("parent creates, edits and soft-deletes a child profile through the UI", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const demoChild = await getDemoChild(page);
  await selectChild(page, demoChild.id);

  await unlockParentGate(page);

  await page.goto("/onboarding");
  await page.getByLabel("Tên thân mật của bé").fill("Mít E2E");
  await page.getByText("6–8 tuổi", { exact: true }).click();
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();
  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByRole("heading", { name: "Mít E2E" })).toBeVisible();

  await page.getByLabel("Chỉnh sửa Mít E2E").click();
  await page.getByLabel("Tên thân mật").fill("Mít Đã Sửa");
  await page.getByLabel("Nhóm tuổi").selectOption("6-8");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page).toHaveURL(/\/profiles$/);
  await expect(page.getByRole("heading", { name: "Mít Đã Sửa" })).toBeVisible();
  await page.getByLabel("Xóa Mít Đã Sửa").click();
  await page
    .getByRole("alertdialog", { name: "Xóa hồ sơ Mít Đã Sửa?" })
    .getByRole("button", { name: "Chuyển sang chờ xóa" })
    .click();
  await expect(page.getByRole("heading", { name: "Mít Đã Sửa" })).toHaveCount(0);

  const children = await apiData<Array<{ displayName: string }>>(await page.request.get("/api/children"));
  expect(children.some((child) => child.displayName === "Mít Đã Sửa")).toBe(false);
});

test("parent gate rejects a wrong answer, supports PIN and exports family data", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);

  await page.goto("/parent");
  await page.getByLabel("Kết quả phép tính").fill("99");
  await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  await expect(page.getByText("Câu trả lời chưa đúng, ba/mẹ thử lại nhé.")).toBeVisible();
  await unlockParentGate(page);

  await page.goto("/parent/settings");
  await page.getByPlaceholder("PIN mới").fill("2468");
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  await expect(page.getByText("Đã lưu cài đặt")).toBeVisible();
  await page.context().clearCookies({ name: "sln_parent_gate" });
  await page.goto("/parent");
  await expect(page.getByLabel("PIN phụ huynh")).toHaveAttribute("placeholder", /Nhập PIN/);
  await page.getByLabel("PIN phụ huynh").fill("2468");
  await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  await expect(page.getByRole("heading", { name: /Tuần của Bống/i })).toBeVisible();

  await page.goto("/parent/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tạo bản sao dữ liệu" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^suy-luan-nhi-export-.*\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const exported = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
    parent: { displayName: string };
    children: Array<{ profile: { displayName: string } }>;
  };
  expect(exported.parent.displayName).toBeTruthy();
  expect(exported.children.some((item) => item.profile.displayName === "Bống")).toBe(true);
});
