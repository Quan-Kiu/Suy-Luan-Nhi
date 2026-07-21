import { describe, expect, it } from "vitest";
import {
  redactFeedbackCaptureClone,
  shouldIncludeInFeedbackCapture,
} from "@/features/feedback/capture-privacy";

describe("feedback capture privacy", () => {
  it("removes live form values from the detached screenshot clone", () => {
    const clone = document.createElement("section");
    clone.innerHTML = `
      <input id="email" type="email" value="parent@example.com" placeholder="Email">
      <input id="password" type="password" value="secret" placeholder="Mật khẩu">
      <input id="check" type="checkbox" checked>
      <textarea id="note" placeholder="Ghi chú">Thông tin riêng</textarea>
      <select id="child"><option selected>Bống</option><option>Na</option></select>
      <div id="editor" contenteditable="true">Nội dung đang soạn</div>
    `;

    redactFeedbackCaptureClone(clone);

    expect((clone.querySelector("#email") as HTMLInputElement).value).toBe("");
    expect(clone.querySelector("#email")).toHaveAttribute("value", "");
    expect(clone.querySelector("#email")).not.toHaveAttribute("placeholder");
    expect((clone.querySelector("#password") as HTMLInputElement).value).toBe("");
    expect((clone.querySelector("#check") as HTMLInputElement).checked).toBe(true);
    expect((clone.querySelector("#note") as HTMLTextAreaElement).value).toBe("");
    expect(clone.querySelector("#note")?.textContent).toBe("");
    const selectedChild = clone.querySelector("#child") as HTMLSelectElement;
    expect(selectedChild.value).toBe("");
    expect(Array.from(selectedChild.options).every((option) => option.textContent === "")).toBe(true);
    expect(clone.querySelector("#editor")?.textContent).toBe("");
  });

  it("hides explicitly private regions while retaining normal page content", () => {
    const privateRegion = document.createElement("div");
    privateRegion.dataset.feedbackPrivate = "";
    const normalRegion = document.createElement("div");

    expect(shouldIncludeInFeedbackCapture(privateRegion)).toBe(false);
    expect(shouldIncludeInFeedbackCapture(normalRegion)).toBe(true);
  });
});
