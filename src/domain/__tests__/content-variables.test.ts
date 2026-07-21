import { describe, expect, it } from "vitest";
import { renderQuestionTemplate } from "@/lib/content/render-question-template";
import {
  defaultContentVariableDefinitions,
  findUnavailableContentVariableKeys,
  renderContentTemplate,
  renderContentTemplatePreview,
} from "@/domain/content-variables";

describe("content variables", () => {
  it("renders active child data at runtime", () => {
    expect(
      renderContentTemplate(
        "Yêu cầu {{name}} quan sát thật kỹ. Nhóm {{age_group}}.",
        defaultContentVariableDefinitions,
        { child: { displayName: "Bống", ageGroup: "6-8" } },
      ),
    ).toBe("Yêu cầu Bống quan sát thật kỹ. Nhóm 6–8 tuổi.");
  });

  it("uses the configured fallback when profile data is missing", () => {
    expect(
      renderContentTemplate("Mời {{name}} bắt đầu.", defaultContentVariableDefinitions, { child: null }),
    ).toBe("Mời bé bắt đầu.");
  });

  it("uses configured examples in admin preview", () => {
    expect(renderContentTemplatePreview("Xin chào {{name}}!", defaultContentVariableDefinitions)).toBe(
      "Xin chào Bống!",
    );
  });

  it("renders tags inside answer labels without changing the answer key", () => {
    const rendered = renderQuestionTemplate(
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: "single_choice",
        order: 1,
        prompt: "{{name}} chọn đáp án đúng",
        instruction: "Quan sát kỹ",
        difficulty: 1,
        payload: {
          options: [
            { id: "a", label: "Đáp án của {{name}}" },
            { id: "b", label: "Đáp án khác" },
          ],
        },
        correctAnswer: "a",
        feedbackCorrect: "Chính xác",
        feedbackIncorrect: "Thử lại nhé",
        hints: [{ level: 1, text: "Nhìn kỹ" }],
      },
      defaultContentVariableDefinitions,
      { child: { displayName: "Bống" } },
    );

    expect(rendered.prompt).toBe("Bống chọn đáp án đúng");
    expect(rendered.type).toBe("single_choice");
    if (rendered.type !== "single_choice") throw new Error("Sai loại câu hỏi");
    expect(rendered.payload.options[0]?.label).toBe("Đáp án của Bống");
    expect(rendered.correctAnswer).toBe("a");
  });

  it("reports unknown and disabled tags", () => {
    expect(
      findUnavailableContentVariableKeys(
        "{{name}} {{rank}} {{unknown_tag}} {{unknown_tag}}",
        defaultContentVariableDefinitions,
      ),
    ).toEqual(["rank", "unknown_tag"]);
  });
});
