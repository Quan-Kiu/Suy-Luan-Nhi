/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and sensor props by design. */
"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { useState } from "react";
import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";
import { useSoundEffects } from "@/features/sound/sound-effects-provider";
import { cn } from "@/lib/utils";

type SortingQuestionType = Extract<PublicPlayableQuestion, { type: "sorting" }>;
type SortingItem = SortingQuestionType["payload"]["items"][number];

type Props = {
  question: SortingQuestionType;
  value: QuestionSubmission | null;
  onChange: (value: QuestionSubmission) => void;
  disabled: boolean;
  renderMedia: (asset: string | undefined, label: string) => React.ReactNode;
};

function SortableRow({
  item,
  index,
  total,
  disabled,
  onMove,
  renderMedia,
}: {
  item: SortingItem;
  index: number;
  total: number;
  disabled: boolean;
  onMove: (delta: -1 | 1) => void;
  renderMedia: Props["renderMedia"];
}) {
  const sortable = useSortable({ id: item.id, disabled });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 border-[#eadfc9] bg-white p-3 shadow-sm transition",
        sortable.isDragging && "z-10 border-[#e9641a] opacity-45 shadow-xl",
      )}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#edf4df] font-black">
        {index + 1}
      </span>
      <button
        type="button"
        disabled={disabled}
        aria-label={`Kéo ${item.label} để đổi vị trí`}
        className="cursor-grab touch-none rounded-lg p-1 text-[#9a876d] focus-visible:outline-4 focus-visible:outline-[#f5b557] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
        {...sortable.attributes}
        {...sortable.listeners}
      >
        <GripVertical size={22} />
      </button>
      {renderMedia(item.asset, item.label)}
      <strong className="min-w-0 flex-1">{item.label}</strong>
      <button
        type="button"
        aria-label={`Đưa ${item.label} lên`}
        disabled={disabled || index === 0}
        onClick={() => onMove(-1)}
        className="rounded-lg border p-2 disabled:opacity-30"
      >
        <ArrowUp size={18} />
      </button>
      <button
        type="button"
        aria-label={`Đưa ${item.label} xuống`}
        disabled={disabled || index === total - 1}
        onClick={() => onMove(1)}
        className="rounded-lg border p-2 disabled:opacity-30"
      >
        <ArrowDown size={18} />
      </button>
    </div>
  );
}

export function SortingQuestion({ question, value, onChange, disabled, renderMedia }: Props) {
  const sound = useSoundEffects();
  const order = Array.isArray(value) ? value : question.payload.items.map((item) => item.id);
  const itemById = new Map(question.payload.items.map((item) => [item.id, item]));
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function move(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    void sound.play("game.sortMove");
    onChange(arrayMove(order, index, target));
  }

  function handleDragStart(event: DragStartEvent) {
    void sound.play("game.dragPickup");
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const active = String(event.active.id);
    const over = event.over ? String(event.over.id) : null;
    if (over && active !== over) {
      const oldIndex = order.indexOf(active);
      const newIndex = order.indexOf(over);
      if (oldIndex >= 0 && newIndex >= 0) {
        void sound.play("game.sortMove");
        onChange(arrayMove(order, oldIndex, newIndex));
      }
    }
    setActiveId(null);
  }
  const activeItem = activeId ? itemById.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <p className="type-supporting mb-3 text-[#6f604b]">
        Kéo từng bước bằng biểu tượng chấm, hoặc dùng nút lên/xuống để sắp xếp.
      </p>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {order.map((id, index) => {
            const item = itemById.get(id);
            if (!item) return null;
            return (
              <SortableRow
                key={id}
                item={item}
                index={index}
                total={order.length}
                disabled={disabled}
                onMove={(delta) => move(index, delta)}
                renderMedia={renderMedia}
              />
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="flex min-w-64 items-center gap-3 rounded-2xl border-2 border-[#e9641a] bg-white p-3 shadow-2xl">
            {renderMedia(activeItem.asset, activeItem.label)}
            <strong>{activeItem.label}</strong>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
