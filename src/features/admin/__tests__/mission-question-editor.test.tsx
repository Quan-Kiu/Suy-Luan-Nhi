import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { createDefaultQuestion } from "@/features/admin/mission-editor/default-question";
import { MissionQuestionEditor } from "@/features/admin/mission-editor/question-editor";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

function TestForm() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const form = useForm<AdminMissionDraft>({
    defaultValues: { questions: [createDefaultQuestion("single_choice", 1)] },
  });
  const hints = useWatch({ control: form.control, name: "questions.0.hints" });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <MissionQuestionEditor
          index={0}
          total={1}
          active
          onActivate={() => undefined}
          onTypeChange={() => undefined}
          onMove={() => undefined}
          onRemove={() => undefined}
          templateVariables={[]}
        />
        <output aria-label="Dữ liệu gợi ý">{JSON.stringify(hints)}</output>
      </FormProvider>
    </QueryClientProvider>
  );
}

describe("MissionQuestionEditor", () => {
  it(
    "keeps the newline after Enter and stores the next line as a separate hint",
    async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const textarea = screen.getByRole("textbox", { name: "Các gợi ý, mỗi dòng một gợi ý" });
      const firstHint = "Con thử nhìn từng phần một nhé.";
      const secondHint = "Nhìn vật liệu và khả năng dùng tiếp.";

      expect(textarea).toHaveValue(firstHint);

      await user.click(textarea);
      await user.keyboard(`{End}{Enter}${secondHint}`);

      expect(textarea).toHaveValue(`${firstHint}\n${secondHint}`);
      expect(screen.getByLabelText("Dữ liệu gợi ý")).toHaveTextContent(
        JSON.stringify([
          { level: 1, text: firstHint },
          { level: 2, text: secondHint },
        ]),
      );
    },
    10_000,
  );
});
