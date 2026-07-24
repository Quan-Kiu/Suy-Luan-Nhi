import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ActiveChildProvider } from "@/features/child/active-child-context";
import { CreateProfileForm } from "@/features/profile/create-profile-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/api/child-avatars", () => ({
  childAvatarsApi: {
    list: vi.fn().mockResolvedValue([
      {
        id: "b071b5d0-1f48-4f1b-8b32-66537e17c001",
        url: "/assets/mascots/mascot-dog-bong-avatar.png",
        altText: "Avatar chó Bống",
      },
      {
        id: "b071b5d0-1f48-4f1b-8b32-66537e17c002",
        url: "/assets/mascots/mascot-detective-boy-standing.png",
        altText: "Avatar nhà thám hiểm",
      },
    ]),
  },
}));

function renderForm() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        })
      }
    >
      <ActiveChildProvider child={null}>
        <CreateProfileForm />
      </ActiveChildProvider>
    </QueryClientProvider>,
  );
}

describe("CreateProfileForm", () => {
  it("shows a field error before sending a one-character nickname", async () => {
    renderForm();
    const submit = await screen.findByRole("button", { name: /tạo hồ sơ và bắt đầu/i });
    await waitFor(() => expect(submit).toBeEnabled());
    await userEvent.type(screen.getByLabelText(/tên thân mật của bé/i), "Q");
    await userEvent.click(submit);
    expect(await screen.findByText("Tên hồ sơ của bé cần ít nhất 2 ký tự")).toBeInTheDocument();
  });

  it("lets the parent select an age group", async () => {
    renderForm();
    await userEvent.click(screen.getByLabelText(/6–8 tuổi/i));
    expect(screen.getByLabelText(/6–8 tuổi/i)).toBeChecked();
  });

  it("lets the parent choose one of the approved avatars", async () => {
    renderForm();
    const avatar = await screen.findByRole("radio", { name: "Avatar nhà thám hiểm" });
    await userEvent.click(avatar);
    expect(avatar).toBeChecked();
  });
});
