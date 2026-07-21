const redactableInputTypes = new Set([
  "date",
  "datetime-local",
  "email",
  "file",
  "month",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "time",
  "url",
  "week",
]);

export const feedbackPrivateSelector = "[data-feedback-private], [data-capture='private']";

export function shouldIncludeInFeedbackCapture(element: Element) {
  return !element.matches(feedbackPrivateSelector);
}

export function redactFeedbackCaptureClone(clone: Element) {
  clone.querySelectorAll("input").forEach((element) => {
    const input = element as HTMLInputElement;
    if (!redactableInputTypes.has(input.type.toLowerCase())) return;
    input.value = "";
    input.setAttribute("value", "");
    input.removeAttribute("placeholder");
  });

  clone.querySelectorAll("textarea").forEach((element) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.value = "";
    textarea.textContent = "";
    textarea.removeAttribute("placeholder");
  });

  clone.querySelectorAll("select").forEach((element) => {
    const select = element as HTMLSelectElement;
    select.querySelectorAll("option").forEach((option) => {
      option.textContent = "";
      option.value = "";
      option.removeAttribute("selected");
      option.removeAttribute("label");
    });
    select.selectedIndex = select.options.length ? 0 : -1;
  });

  clone.querySelectorAll('[contenteditable]:not([contenteditable="false"])').forEach((element) => {
    element.textContent = "";
  });
}
