import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ParentGateForm } from "@/features/parent/parent-gate-form";

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    error: null,
    isError: false,
    isPending: false,
    mutate: vi.fn(),
  }),
}));

vi.mock("@/content/client", () => ({
  contentText: (_content: unknown, _key: string, fallback: string) => fallback,
  useContent: () => ({}),
}));

vi.mock("@/hooks/use-pending-router", () => ({
  usePendingRouter: () => ({ isPending: false, refresh: vi.fn() }),
}));

describe("ParentGateForm", () => {
  it("keeps enough input height for large Vietnamese PIN typography", () => {
    render(<ParentGateForm />);

    const pinInput = screen.getByLabelText("Mã PIN phụ huynh");
    expect(pinInput).toHaveClass("type-child-section-title", "min-h-16");
    expect(pinInput).not.toHaveClass("min-h-14");
  });
});
