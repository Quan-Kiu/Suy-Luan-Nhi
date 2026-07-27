import { expect, test, type Page } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

async function installSoundRecorder(page: Page) {
  await page.addInitScript(() => {
    const played: string[] = [];
    Object.defineProperty(window, "__slnPlayedSounds", { value: played, writable: false });
    HTMLMediaElement.prototype.play = function play() {
      const source = this.currentSrc || this.src;
      played.push(new URL(source, window.location.href).pathname);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function pause() {};
  });
}

async function playedSounds(page: Page) {
  return page.evaluate(() =>
    ((window as unknown as { __slnPlayedSounds?: string[] }).__slnPlayedSounds ?? []).slice(),
  );
}

async function expectSound(page: Page, fileName: string) {
  await expect.poll(() => playedSounds(page)).toContain(`/audio/sfx/kenney/${fileName}`);
}
test("Kenney sounds follow gameplay events", async ({ page }) => {
  await installSoundRecorder(page);
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));

  await page.goto("/missions");
  await page.getByRole("button", { name: /Nhịp đèn lồng\. Nhiệm vụ (?:này )?chưa mở/ }).click();
  await expectSound(page, "mission-locked.ogg");

  await page.getByRole("link", { name: /Thám tử dấu chân/i }).click();
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();
  await page.getByRole("button", { name: /Gợi ý cho con/i }).click();
  await expectSound(page, "hint-reveal.ogg");

  await page.getByRole("button", { name: "Mặt trăng", exact: true }).click();
  await expectSound(page, "ui-select-1.ogg");
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await expectSound(page, "answer-retry.ogg");
  await expect(page.getByText("Chưa chính xác", { exact: true })).toBeVisible();
  const retryButton = page.getByRole("button", { name: /Thử lại/i });
  await expect(retryButton).toHaveAttribute("class", /border-\[#d99539\]/);
  await expect(retryButton).not.toHaveAttribute("class", /green|6c9951/i);

  await retryButton.click();
  await page.getByRole("button", { name: "Ngôi sao", exact: true }).click();
  await expectSound(page, "ui-select-2.ogg");
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await expectSound(page, "answer-correct.ogg");

  await page.getByRole("button", { name: /Câu tiếp theo/i }).click();
  await page.getByRole("button", { name: "Dấu chân xanh", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await page.getByRole("button", { name: /Nhận huy hiệu/i }).click();
  await expect(page).toHaveURL(/\/complete\//);
  await expect.poll(() => playedSounds(page)).toContain("/audio/sfx/original/mission-complete-chime.ogg");
});

test("disabling sound in parent settings prevents playback", async ({ page }) => {
  await installSoundRecorder(page);
  await signIn(page, "parent@demo.local");
  const child = await getDemoChild(page);
  await selectChild(page, child.id);
  await unlockParentGate(page);
  await apiData(await page.request.post(`/api/children/${child.id}/reset-progress`));

  await page.goto("/parent/settings");
  const soundToggle = page.getByLabel("Âm thanh khi bấm và trả lời");
  await soundToggle.uncheck();
  const saveResponse = page.waitForResponse(
    (response) => response.request().method() === "PATCH" && response.url().endsWith("/api/parent/settings"),
  );
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  const savedEnvelope = (await (await saveResponse).json()) as {
    success: boolean;
    data: { updated: boolean };
  };
  expect(savedEnvelope).toMatchObject({ success: true, data: { updated: true } });
  await expect(page.getByText("Đã lưu cài đặt", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Âm thanh khi bấm và trả lời")).not.toBeChecked();

  await page.goto("/missions");
  await page.getByRole("button", { name: /Nhịp đèn lồng\. Nhiệm vụ (?:này )?chưa mở/ }).click();
  await expect(page.getByText("Nhiệm vụ này chưa mở", { exact: true })).toBeVisible();
  expect(await playedSounds(page)).toEqual([]);

  const restoreResponse = await page.request.patch("/api/parent/settings", {
    data: { effectsEnabled: true },
  });
  expect(restoreResponse.ok()).toBe(true);
});
