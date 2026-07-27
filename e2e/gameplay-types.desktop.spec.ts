import { expect, test, type Page } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

async function startMission(page: Page, name: RegExp) {
  await page.goto("/missions");
  await page.getByRole("link", { name }).click();
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await expect(page).toHaveURL(/\/play\//);
}

async function submitCorrect(page: Page, nextLabel: RegExp) {
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await expect(page.getByText("Tuyệt vời!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: nextLabel }).click();
}

async function finishMission(page: Page) {
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await expect(page.getByText("Tuyệt vời!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Nhận huy hiệu/i }).click();
  await expect(page).toHaveURL(/\/complete\//);
}

async function sortItems(page: Page, expectedLabels: string[]) {
  for (let targetIndex = 0; targetIndex < expectedLabels.length; targetIndex += 1) {
    const label = expectedLabels[targetIndex];
    for (;;) {
      const handles = page.locator('button[aria-label^="Kéo "][aria-label$=" để đổi vị trí"]');
      await expect(handles).toHaveCount(expectedLabels.length);
      const labels = await handles.evaluateAll((elements) =>
        elements.map((element) => {
          const ariaLabel = element.getAttribute("aria-label") ?? "";
          return ariaLabel.slice("Kéo ".length, -" để đổi vị trí".length);
        }),
      );
      const currentIndex = labels.indexOf(label);
      expect(currentIndex, `Không tìm thấy mục sắp xếp ${label}`).toBeGreaterThanOrEqual(0);
      if (currentIndex <= targetIndex) break;
      await page.getByRole("button", { name: `Đưa ${label} lên` }).click();
    }
  }
}

test("all five gameplay question renderers submit and persist correct answers", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));
  await startMission(page, /Thám tử dấu chân/i);
  await page.getByRole("button", { name: "Ngôi sao", exact: true }).click();
  await submitCorrect(page, /Câu tiếp theo/i);
  await page.getByRole("button", { name: "Dấu chân xanh", exact: true }).click();
  await finishMission(page);

  await startMission(page, /Nhịp đèn lồng/i);
  await page.getByRole("button", { name: "Xanh", exact: true }).click();
  await submitCorrect(page, /Câu tiếp theo/i);
  await page.getByLabel("Câu trả lời").fill("2");
  await finishMission(page);

  await startMission(page, /Kệ đồ trong rừng/i);
  await sortItems(page, ["Kính lúp", "Ba lô", "Nhà cây"]);
  await submitCorrect(page, /Câu tiếp theo/i);

  await page.getByRole("button", { name: /^Sách\./ }).click();
  await page.getByRole("button", { name: /Góc đọc sách/i }).click();
  await page.getByRole("button", { name: /^La bàn\./ }).click();
  await page.getByRole("button", { name: /Túi khám phá/i }).click();
  await finishMission(page);

  const map = await apiData<{
    worlds: Array<{ missions: Array<{ title: string; completed: boolean }> }>;
  }>(await page.request.get(`/api/children/${child.id}/mission-map`));
  const completedTitles = map.worlds.flatMap((world) =>
    world.missions.filter((mission) => mission.completed).map((mission) => mission.title),
  );
  expect(completedTitles).toEqual(
    expect.arrayContaining(["Thám tử dấu chân", "Nhịp đèn lồng", "Kệ đồ trong rừng"]),
  );
});
