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
  await page.getByRole("button", { name: /Nhịp đèn lồng\. Nhiệm vụ chưa mở/ }).click();
  await expectSound(page, "mission-locked.ogg");

  await page.getByRole("link", { name: /Thám tử dấu chân/i }).click();
  await page.getByRole("button", { name: /Bắt đầu nhiệm vụ/i }).click();
  await page.getByRole("button", { name: /Cho con một gợi ý/i }).click();
  await expectSound(page, "hint-reveal.ogg");

  await page.getByRole("button", { name: "Mặt trăng", exact: true }).click();
  await expectSound(page, "ui-select-1.ogg");
  await page.getByRole("button", { name: /Kiểm tra đáp án/i }).click();
  await expectSound(page, "answer-retry.ogg");

  await page.getByRole("button", { name: /Thử lại/i }).click();
  await page.getByRole("button", { name: "Ngôi sao", exact: true }).click();
  await expectSound(page, "ui-select-2.ogg");
  await page.getByRole("button", { name: /Kiểm tra đáp án/i }).click();
  await expectSound(page, "answer-correct.ogg");

  await page.getByRole("button", { name: /Câu tiếp theo/i }).click();
  await page.getByRole("button", { name: "Dấu chân xanh", exact: true }).click();
  await page.getByRole("button", { name: /Kiểm tra đáp án/i }).click();
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
  const soundToggle = page.getByLabel("Âm thanh tương tác");
  await soundToggle.uncheck();
  const saveResponse = page.waitForResponse(
    (response) => response.request().method() === "PATCH" && response.url().endsWith("/api/parent/settings"),
  );
  await page.getByRole("button", { name: "Lưu cài đặt" }).click();
  const savedEnvelope = (await (await saveResponse).json()) as {
    success: boolean;
    data: { soundEnabled: boolean };
  };
  expect(savedEnvelope.success).toBe(true);
  expect(savedEnvelope.data.soundEnabled).toBe(false);
  await expect(page.getByText("Đã lưu cài đặt", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Âm thanh tương tác")).not.toBeChecked();

  await page.goto("/missions");
  await page.getByRole("button", { name: /Nhịp đèn lồng\. Nhiệm vụ chưa mở/ }).click();
  await expect(page.getByText("Nhiệm vụ chưa mở", { exact: true })).toBeVisible();
  expect(await playedSounds(page)).toEqual([]);
});
