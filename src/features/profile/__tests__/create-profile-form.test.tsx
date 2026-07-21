import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateProfileForm } from "@/features/profile/create-profile-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderForm() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <CreateProfileForm />
    </QueryClientProvider>,
  );
}

describe("CreateProfileForm", () => {
  it("shows a field error before sending an empty nickname", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: /tạo hồ sơ và bắt đầu/i }));
    expect(await screen.findByText("Hãy nhập tên thân mật")).toBeInTheDocument();
  });

  it("lets the parent select an age group", async () => {
    renderForm();
    await userEvent.click(screen.getByLabelText(/6–8 tuổi/i));
    expect(screen.getByLabelText(/6–8 tuổi/i)).toBeChecked();
  });
});
