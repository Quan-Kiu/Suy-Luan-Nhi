import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MissionEditor } from "@/features/admin/mission-editor";

function renderEditor() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MissionEditor />
    </QueryClientProvider>,
  );
}

describe("MissionEditor", () => {
  it("shows field-level validation when required content is cleared", async () => {
    renderEditor();
    const title = screen.getByLabelText("Tiêu đề");
    await userEvent.clear(title);
    await userEvent.click(screen.getAllByRole("button", { name: /^lưu$/i })[0]);
    expect(await screen.findByText("Tiêu đề cần ít nhất 3 ký tự")).toBeInTheDocument();
  });

  it("disables review submission when the Safety Checklist is incomplete", async () => {
    renderEditor();
    await userEvent.click(screen.getByLabelText("Không liên kết ngoài"));
    expect(screen.getByRole("button", { name: /gửi duyệt/i })).toBeDisabled();
  });
});
