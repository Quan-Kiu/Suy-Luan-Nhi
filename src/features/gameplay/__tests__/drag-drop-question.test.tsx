import { render, screen } from "@testing-library/react";
import type { CollisionDetection } from "@dnd-kit/core";
import { describe, expect, it, vi } from "vitest";
import { DragDropQuestion, strictDropCollisionDetection } from "@/features/gameplay/drag-drop-question";

vi.mock("@/features/sound/sound-effects-provider", () => ({
  useSoundEffects: () => ({ play: vi.fn() }),
}));

const slotRect = { width: 100, height: 80, top: 20, left: 20, right: 120, bottom: 100 };

function collisionArgs(pointerCoordinates: { x: number; y: number } | null) {
  return {
    active: {},
    collisionRect: { width: 20, height: 20, top: 30, left: 30, right: 50, bottom: 50 },
    droppableRects: new Map([["slot-1", slotRect]]),
    droppableContainers: [{ id: "slot-1" }],
    pointerCoordinates,
  } as Parameters<CollisionDetection>[0];
}

describe("strictDropCollisionDetection", () => {
  it("accepts a pointer only while it is inside a slot", () => {
    expect(strictDropCollisionDetection(collisionArgs({ x: 60, y: 60 }))).toHaveLength(1);
    expect(strictDropCollisionDetection(collisionArgs({ x: 180, y: 160 }))).toEqual([]);
  });
});

const question = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  order: 1,
  prompt: "Ghép nguyên nhân với kết quả",
  instruction: "Kéo từng hình vào đúng vị trí",
  difficulty: 1,
  feedbackCorrect: "Con làm đúng rồi",
  feedbackIncorrect: "Con thử lại nhé",
  hints: [{ level: 1, text: "Nhìn vào nhu cầu của cây" }],
  type: "drag_drop" as const,
  payload: {
    items: [{ id: "sun", label: "Ánh nắng", asset: "/sun.png" }],
    slots: [{ id: "leaf", label: "Lá nhận ánh sáng" }],
  },
};

describe("DragDropQuestion", () => {
  it("shows the assigned answer image inside its slot", () => {
    render(
      <DragDropQuestion
        question={question}
        value={{ leaf: "sun" }}
        disabled={false}
        onChange={vi.fn()}
        renderMedia={(_, label) => <span role="img" aria-label={label} />}
      />,
    );

    expect(screen.getAllByRole("img", { name: "Ánh nắng" })).toHaveLength(2);
    expect(screen.getByText("Lá nhận ánh sáng")).toBeVisible();
  });
});
