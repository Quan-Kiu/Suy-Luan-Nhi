import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

test("prevents a stale resource editor from overwriting a newer update", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/resources");
  const suffix = Date.now().toString(36);
  const input = {
    slug: `resource-conflict-${suffix}`,
    title: "Bài viết kiểm tra xung đột",
    excerpt: "Tài nguyên được tạo để kiểm tra hai quản trị viên cùng chỉnh sửa.",
    content: "Nội dung ban đầu đủ dài để kiểm tra cơ chế chống ghi đè dữ liệu trên giao diện quản trị.",
    resourceType: "article" as const,
    category: "thinking" as const,
    ageGroups: ["6-8" as const],
    coverUrl: "/assets/props/parent-value-family-support.png",
    mediaUrl: null,
    sortOrder: 999,
    status: "draft" as const,
  };
  const resource = await apiData<{
    id: string;
    revision: number;
  }>(await page.request.post("/api/admin/resources", { data: input }));

  try {
    await page.goto(`/admin/resources/${resource.id}/edit`);
    await expect(page.getByLabel("Tiêu đề")).toHaveValue(input.title);

    const newerTitle = "Nội dung mới từ quản trị viên thứ nhất";
    const newer = await apiData<{ revision: number }>(
      await page.request.patch(`/api/admin/resources/${resource.id}`, {
        headers: { "x-resource-revision": String(resource.revision) },
        data: { ...input, title: newerTitle },
      }),
    );
    expect(newer.revision).toBe(resource.revision + 1);

    await page.getByLabel("Tiêu đề").fill("Dữ liệu cũ từ tab thứ hai");
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    const conflictAlert = page.getByRole("alert").filter({
      hasText: "Bài viết vừa được cập nhật ở nơi khác",
    });
    await expect(conflictAlert).toContainText("Bài viết vừa được cập nhật ở nơi khác");
    await expect(conflictAlert).toContainText(`Phiên bản hiện tại là ${newer.revision}`);

    await page.getByRole("button", { name: "Tải phiên bản mới nhất" }).click();
    await expect(page.getByLabel("Tiêu đề")).toHaveValue(newerTitle);
    await expect(conflictAlert).toHaveCount(0);
  } finally {
    const latest = await apiData<{ revision: number }>(
      await page.request.get(`/api/admin/resources/${resource.id}`),
    );
    await page.request.delete(`/api/admin/resources/${resource.id}`, {
      headers: { "x-resource-revision": String(latest.revision) },
    });
  }
});
