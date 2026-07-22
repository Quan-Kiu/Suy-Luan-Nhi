import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { MissionRewardBadgeField } from "@/features/admin/mission-editor/reward-badge-field";
import type { MissionEditorTaxonomy } from "@/features/admin/mission-editor/types";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

const badges: MissionEditorTaxonomy["badges"] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Quan sát kỹ",
    iconUrl: "/assets/props/badge-sharp-detective.png",
    active: true,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Huy hiệu cũ",
    iconUrl: "/assets/props/badge-safe-heart.png",
    active: false,
  },
];

function TestForm({ initial = null }: { initial?: string | null }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const form = useForm<AdminMissionDraft>({ defaultValues: { rewardBadgeId: initial } });
  const selected = useWatch({ control: form.control, name: "rewardBadgeId" });
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <MissionRewardBadgeField badges={badges} />
        <output aria-label="Huy hiệu đã chọn">{selected ?? "none"}</output>
      </FormProvider>
    </QueryClientProvider>
  );
}

describe("MissionRewardBadgeField", () => {
  it("makes mission badge configuration visible and updates the form value", async () => {
    const user = userEvent.setup();
    render(<TestForm />);

    expect(screen.getByRole("heading", { name: "Huy hiệu khi hoàn thành" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Quản lý huy hiệu" })).toHaveAttribute("href", "/admin/badges");
    expect(screen.getByRole("radio", { name: /Không trao huy hiệu/ })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: /Quan sát kỹ/ }));

    expect(screen.getByRole("radio", { name: /Quan sát kỹ/ })).toBeChecked();
    expect(screen.getByLabelText("Huy hiệu đã chọn")).toHaveTextContent(badges[0].id);
  });

  it("keeps the currently assigned inactive badge visible", () => {
    render(<TestForm initial={badges[1].id} />);

    expect(screen.getByRole("radio", { name: /Huy hiệu cũ/ })).toBeChecked();
    expect(screen.getByText("Đã ngừng dùng — đang được nhiệm vụ này chọn")).toBeVisible();
  });
});
