import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { defaultContentVariableDefinitions } from "@/domain/content-variables";
import { ContentTemplateField } from "@/features/admin/content-template-field";

function TestField() {
  const [value, setValue] = useState("");
  return (
    <ContentTemplateField
      label="Câu hỏi dành cho bé"
      value={value}
      onValueChange={setValue}
      variables={defaultContentVariableDefinitions}
    />
  );
}

describe("ContentTemplateField", () => {
  it("suggests enabled tags after typing opening braces and inserts the selected tag", async () => {
    const user = userEvent.setup();
    render(<TestField />);

    const input = screen.getByRole("textbox", { name: "Câu hỏi dành cho bé" });
    fireEvent.change(input, { target: { value: "Yêu cầu {{" } });

    await waitFor(() => expect(screen.getByRole("button", { name: /Tên bé/ })).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /Hạng hiện tại/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Tên bé/ }));
    expect(input).toHaveValue("Yêu cầu {{name}}");
  });

  it("opens the same suggestions from the visible insert action", async () => {
    const user = userEvent.setup();
    render(<TestField />);

    await user.click(screen.getByRole("button", { name: "Chèn biến" }));
    expect(screen.getByRole("button", { name: /Tên bé/ })).toBeInTheDocument();
  });
});
