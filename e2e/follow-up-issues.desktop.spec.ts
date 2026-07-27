import { expect, test } from "@playwright/test";
import { apiData, clearAuth, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4S8AAAAASUVORK5CYII=",
  "base64",
);

test.describe("follow-up issue regressions", () => {
  test("invalid mission save uses clear Vietnamese and never shows success", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/missions/new");
    let saveRequests = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().endsWith("/api/admin/missions")) saveRequests += 1;
    });

    const subtitle = page.getByRole("textbox", { name: "Câu giới thiệu ngắn" });
    await expect(subtitle).toBeEditable();
    await subtitle.fill("a");
    await expect(subtitle).toHaveValue("a");
    await expect(page.getByText("Câu giới thiệu cần ít nhất 3 ký tự")).toBeVisible();
    await expect(page.getByText(/Too small|expected string/i)).toHaveCount(0);

    await page.getByRole("button", { name: "Lưu và làm tiếp sau" }).first().click();
    await expect(page.getByText(/bản nháp chưa được lưu/i)).toBeVisible();
    await expect(page.getByText("Đã lưu bản nháp")).toHaveCount(0);
    expect(saveRequests).toBe(0);
  });
  test("mission cover uploads from a local file and receives a storage URL", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/missions/new");
    await page.getByText("Thiết lập nâng cao", { exact: true }).click();
    const uploadResponse = page.waitForResponse(
      (response) => response.request().method() === "POST" && response.url().endsWith("/api/admin/media"),
    );
    const coverUploadButton = page.getByRole("button", {
      name: /Ảnh hiển thị trên thẻ Tải tệp (?:mới|khác)/,
    });
    const coverInput = coverUploadButton.locator("xpath=parent::div/following-sibling::input[@type='file']");
    await coverInput.setInputFiles({
      name: "mission-cover-e2e.png",
      mimeType: "image/png",
      buffer: tinyPng,
    });
    expect((await uploadResponse).status()).toBe(201);
    await expect(page.getByText("Tệp đã được gắn tự động vào nội dung.")).toBeVisible();
  });

  test("clicking a locked mission explains the unlock requirement", async ({ page }) => {
    await signIn(page, "parent@demo.local");
    const child = await getDemoChild(page);
    await selectChild(page, child.id);
    await unlockParentGate(page);
    await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));
    await page.goto("/missions");
    await page.getByRole("button", { name: /Nhịp đèn lồng\. Nhiệm vụ (?:này )?chưa mở/ }).click();
    await expect(page.getByText("Nhiệm vụ này chưa mở", { exact: true })).toBeVisible();
    await expect(page.getByText(/Hoàn thành “Thám tử dấu chân”/)).toBeVisible();
  });
  test("resource detail uses Vietnamese labels instead of category codes", async ({ page }) => {
    await signIn(page, "parent@demo.local");
    const child = await getDemoChild(page);
    await selectChild(page, child.id);
    await unlockParentGate(page);
    await page.goto("/parent/resources/dong-hanh-khi-be-chua-trung");
    await expect(page.getByRole("heading", { name: "Khi bé chưa trả lời đúng" })).toBeVisible();
    await expect(page.getByText("Đồng hành", { exact: true })).toBeVisible();
    await expect(page.getByText("Hướng dẫn", { exact: true })).toBeVisible();
    await expect(page.getByText("companionship", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/chưa (?:trúng|chúng)/i)).toHaveCount(0);
  });

  test("mission cover and title render inside one bordered card", async ({ page }) => {
    await signIn(page, "parent@demo.local");
    const child = await getDemoChild(page);
    await selectChild(page, child.id);
    await page.goto("/missions/footprint-detective");
    const title = page.getByRole("heading", { name: "Thám tử dấu chân" });
    const container = title.locator("xpath=ancestor::*[contains(@class,'overflow-hidden')][1]");
    await expect(container).toBeVisible();
    await expect(container.locator("img").first()).toBeVisible();
  });

  test("video resources upload a file and render a player for parents", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/resources/new");
    await page.getByLabel("Loại tài nguyên").selectOption("video");
    await expect(page.getByRole("button", { name: "Tệp video Tải tệp mới" })).toBeVisible();

    const upload = await apiData<{ url: string }>(
      await page.request.post("/api/admin/media", {
        multipart: {
          file: {
            name: "parent-guide.webm",
            mimeType: "video/webm",
            buffer: Buffer.from("tiny-webm-e2e"),
          },
          altText: "Video hướng dẫn E2E",
          category: "video-guide",
        },
      }),
    );
    const slug = "video-huong-dan-e2e";
    await apiData(
      await page.request.post("/api/admin/resources", {
        data: {
          slug,
          title: "Video hướng dẫn E2E",
          excerpt: "Video ngắn hướng dẫn phụ huynh đồng hành cùng trẻ.",
          content: "Nội dung mô tả chi tiết cho video hướng dẫn phụ huynh trong gia đình.",
          resourceType: "video",
          category: "companionship",
          ageGroups: ["6-8", "9-10", "11-12"],
          coverUrl: "/assets/scenes/scene-parent-guidance.png",
          mediaUrl: upload.url,
          sortOrder: 90,
          status: "published",
        },
      }),
    );

    await clearAuth(page);
    await signIn(page, "parent@demo.local");
    const child = await getDemoChild(page);
    await selectChild(page, child.id);
    await unlockParentGate(page);
    await page.goto(`/parent/resources/${slug}`);
    const player = page.locator("video");
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute("src", upload.url);
  });

  test("landing keeps the staff workspace separate from parent and marketing actions", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin");

    await page.goto("/");
    const adminEntry = page.getByRole("link", { name: "Trang quản trị" });
    await expect(adminEntry).toBeVisible();
    await expect(adminEntry).toHaveAttribute("href", "/admin");
    await expect(page.getByRole("link", { name: "Khu vực phụ huynh" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Mở trang quản trị" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Bắt đầu cho bé/ })).toHaveCount(0);
  });
});
