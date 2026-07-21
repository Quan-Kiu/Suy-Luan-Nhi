import {
  renderContentTemplate,
  type ContentVariableContext,
  type ContentVariableDefinition,
} from "@/domain/content-variables";
import type { PlayableQuestion } from "@/modules/gameplay/question";

function renderOption<T extends { label: string; altText?: string }>(
  option: T,
  definitions: readonly ContentVariableDefinition[],
  context: ContentVariableContext,
): T {
  return {
    ...option,
    label: renderContentTemplate(option.label, definitions, context),
    ...(option.altText ? { altText: renderContentTemplate(option.altText, definitions, context) } : {}),
  };
}

export function renderQuestionTemplate(
  question: PlayableQuestion,
  definitions: readonly ContentVariableDefinition[],
  context: ContentVariableContext,
): PlayableQuestion {
  const renderedText = {
    prompt: renderContentTemplate(question.prompt, definitions, context),
    instruction: renderContentTemplate(question.instruction, definitions, context),
    feedbackCorrect: renderContentTemplate(question.feedbackCorrect, definitions, context),
    feedbackIncorrect: renderContentTemplate(question.feedbackIncorrect, definitions, context),
    hints: question.hints.map((hint) => ({
      ...hint,
      text: renderContentTemplate(hint.text, definitions, context),
    })),
  };

  switch (question.type) {
    case "single_choice":
      return {
        ...question,
        ...renderedText,
        payload: {
          options: question.payload.options.map((option) => renderOption(option, definitions, context)),
        },
      };
    case "pattern_sequence":
      return {
        ...question,
        ...renderedText,
        payload: {
          sequence: question.payload.sequence.map((option) => renderOption(option, definitions, context)),
          options: question.payload.options.map((option) => renderOption(option, definitions, context)),
        },
      };
    case "drag_drop":
      return {
        ...question,
        ...renderedText,
        payload: {
          items: question.payload.items.map((option) => renderOption(option, definitions, context)),
          slots: question.payload.slots.map((slot) => ({
            ...slot,
            label: renderContentTemplate(slot.label, definitions, context),
          })),
        },
      };
    case "fill_answer":
      return {
        ...question,
        ...renderedText,
        payload: {
          ...question.payload,
          ...(question.payload.placeholder
            ? {
                placeholder: renderContentTemplate(question.payload.placeholder, definitions, context),
              }
            : {}),
        },
      };
    case "sorting":
      return {
        ...question,
        ...renderedText,
        payload: {
          items: question.payload.items.map((option) => renderOption(option, definitions, context)),
        },
      };
  }
}
