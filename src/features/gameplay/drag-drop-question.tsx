/* eslint-disable react-hooks/refs -- dnd-kit exposes callback refs and sensor props by design. */
"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  rectIntersection,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";
import { useSoundEffects } from "@/features/sound/sound-effects-provider";
import { cn } from "@/lib/utils";

type DragQuestion = Extract<PublicPlayableQuestion, { type: "drag_drop" }>;
type Assignments = Record<string, string>;
type Item = DragQuestion["payload"]["items"][number];
type Slot = DragQuestion["payload"]["slots"][number];

type Props = {
  question: DragQuestion;
  value: QuestionSubmission | null;
  onChange: (value: QuestionSubmission) => void;
  disabled: boolean;
  renderMedia: (asset: string | undefined, label: string) => React.ReactNode;
};

export const strictDropCollisionDetection: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

function DraggableItem({
  item,
  selected,
  assigned,
  disabled,
  onSelect,
  renderMedia,
}: {
  item: Item;
  selected: boolean;
  assigned: boolean;
  disabled: boolean;
  onSelect: () => void;
  renderMedia: Props["renderMedia"];
}) {
  const draggable = useDraggable({ id: item.id, disabled: disabled || assigned });
  const style = {
    transform: CSS.Translate.toString(draggable.transform),
    touchAction: "none" as const,
  };
  return (
    <button
      ref={draggable.setNodeRef}
      type="button"
      style={style}
      disabled={disabled || assigned}
      onClick={onSelect}
      {...draggable.listeners}
      {...draggable.attributes}
      aria-pressed={selected}
      aria-label={`${item.label}. Kéo đến nhóm phù hợp hoặc chọn rồi chạm vào nhóm.`}
      className={cn(
        "relative min-h-28 cursor-grab rounded-[22px] border-2 bg-white p-3 text-center font-black shadow-sm transition active:cursor-grabbing",
        "focus-visible:outline-4 focus-visible:outline-[#f5b557]",
        selected ? "border-[#e9641a] bg-[#fff2df] ring-4 ring-[#f5b557]/30" : "border-[#eadfc9]",
        assigned && "opacity-35",
        draggable.isDragging && "z-10 cursor-grabbing opacity-45 shadow-xl",
      )}
    >
      <GripVertical className="absolute top-2 right-2 text-[#a08d70]" size={17} aria-hidden />
      {renderMedia(item.asset, item.label)}
      <span className="mt-1 block">{item.label}</span>
    </button>
  );
}
function DroppableSlot({
  slot,
  item,
  selectedItemId,
  disabled,
  onAssign,
  onClear,
  renderMedia,
}: {
  slot: Slot;
  item?: Item;
  selectedItemId: string | null;
  disabled: boolean;
  onAssign: () => void;
  onClear: () => void;
  renderMedia: Props["renderMedia"];
}) {
  const droppable = useDroppable({ id: slot.id, disabled });
  return (
    <div
      ref={droppable.setNodeRef}
      className={cn(
        "grid min-h-24 grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-[22px] border-2 border-dashed p-3 transition",
        droppable.isOver ? "scale-[1.01] border-[#e9641a] bg-[#fff0df]" : "border-[#cbb58d] bg-[#fff8e9]",
      )}
    >
      <span
        className={cn(
          "relative grid size-16 place-items-center overflow-hidden bg-white shadow-sm",
          item ? "rounded-2xl border border-[#eadfc9]" : "rounded-full",
          "[&_img]:h-full [&_img]:w-full [&_img]:object-contain",
        )}
      >
        {item ? renderMedia(item.asset, item.label) : <Check size={19} />}
        {item ? (
          <span className="absolute right-0.5 bottom-0.5 grid size-5 place-items-center rounded-full bg-[#e9641a] text-white shadow">
            <Check size={13} strokeWidth={3} aria-hidden />
          </span>
        ) : null}
      </span>
      <button
        type="button"
        disabled={disabled || (!selectedItemId && !item)}
        onClick={onAssign}
        className="min-w-0 text-left disabled:cursor-not-allowed"
      >
        <strong className="type-card-title block">{slot.label}</strong>
        <small className="mt-1 block leading-5 text-[#6f604b]">
          {item ? item.label : selectedItemId ? "Chạm để đặt vật đang chọn" : "Kéo một vật vào vùng này"}
        </small>
      </button>
      {item ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={`Đưa ${item.label} trở lại danh sách`}
          onClick={onClear}
          className="type-caption inline-flex min-h-10 items-center gap-1 rounded-xl border bg-white px-3 font-black"
        >
          <RotateCcw size={15} /> Đổi
        </button>
      ) : null}
    </div>
  );
}
export function DragDropQuestion({ question, value, onChange, disabled, renderMedia }: Props) {
  const sound = useSoundEffects();
  const instructionsId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const assignments: Assignments = value && !Array.isArray(value) && typeof value === "object" ? value : {};
  const assignedIds = new Set(Object.values(assignments));
  const itemById = new Map(question.payload.items.map((item) => [item.id, item]));
  const activeItem = activeId ? itemById.get(activeId) : undefined;

  function assign(itemId: string, slotId: string) {
    const next = { ...assignments };
    for (const [key, assignedItem] of Object.entries(next)) {
      if (assignedItem === itemId || key === slotId) delete next[key];
    }
    next[slotId] = itemId;
    void sound.play("game.dragDrop");
    onChange(next);
    setSelectedId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    const itemId = String(event.active.id);
    void sound.play("game.dragPickup");
    setActiveId(itemId);
    setSelectedId(itemId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const itemId = String(event.active.id);
    const slotId = event.over ? String(event.over.id) : null;
    if (slotId) assign(itemId, slotId);
    else setSelectedId(null);
    setActiveId(null);
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={strictDropCollisionDetection}
      onDragStart={handleDragStart}
      onDragCancel={() => {
        setActiveId(null);
        setSelectedId(null);
      }}
      onDragEnd={handleDragEnd}
    >
      <p id={instructionsId} className="sr-only">
        Kéo từng vật đến nhóm phù hợp. Trên bàn phím hoặc màn hình cảm ứng, có thể chọn vật rồi chọn nhóm.
      </p>
      <div className="space-y-5" aria-describedby={instructionsId}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {question.payload.items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              assigned={assignedIds.has(item.id)}
              disabled={disabled}
              onSelect={() => {
                void sound.play("ui.select");
                setSelectedId((current) => (current === item.id ? null : item.id));
              }}
              renderMedia={renderMedia}
            />
          ))}
        </div>
        <div className="space-y-3">
          {question.payload.slots.map((slot) => {
            const itemId = assignments[slot.id];
            return (
              <DroppableSlot
                key={slot.id}
                slot={slot}
                item={itemId ? itemById.get(itemId) : undefined}
                selectedItemId={selectedId}
                disabled={disabled}
                onAssign={() => selectedId && assign(selectedId, slot.id)}
                renderMedia={renderMedia}
                onClear={() => {
                  const next = { ...assignments };
                  delete next[slot.id];
                  void sound.play("ui.select");
                  onChange(next);
                }}
              />
            );
          })}
        </div>
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="w-32 rounded-2xl border-2 border-[#e9641a] bg-white p-3 text-center font-black shadow-2xl">
            {renderMedia(activeItem.asset, activeItem.label)}
            {activeItem.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
