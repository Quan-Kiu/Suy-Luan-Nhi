import { render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui";

describe("Button", () => {
  it("keeps an icon and short action label aligned on one line", () => {
    render(
      <Button className="whitespace-nowrap">
        <Check aria-hidden="true" />
        Xác minh và tiếp tục
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Xác minh và tiếp tục" });
    expect(button).toHaveClass("inline-flex", "items-center", "justify-center", "gap-2", "whitespace-nowrap");
  });
});
