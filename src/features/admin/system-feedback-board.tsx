"use client";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarClock,
  ChevronRight,
  GripVertical,
  ImageIcon,
  LoaderCircle,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import type { SystemFeedbackItem } from "@/api/admin/feedback";
import {
  systemFeedbackStatuses,
  systemFeedbackStatusLabels,
  type SystemFeedbackStatus,
} from "@/domain/system-feedback";
import { cn } from "@/lib/utils";

const columnStyles: Record<
  SystemFeedbackStatus,
  { accent: string; surface: string; count: string; dot: string }
> = {
  new: {
    accent: "border-blue-200",
    surface: "bg-blue-50/55",
    count: "border-blue-200 bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
  in_progress: {
    accent: "border-amber-200",
    surface: "bg-amber-50/55",
    count: "border-amber-200 bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
  },
  resolved: {
    accent: "border-emerald-200",
    surface: "bg-emerald-50/55",
    count: "border-emerald-200 bg-emerald-100 text-emerald-800",
    dot: "bg-emerald-500",
  },
  dismissed: {
    accent: "border-slate-200",
    surface: "bg-slate-50/70",
    count: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
};

function formatFeedbackTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type FeedbackCardProps = {
  item: SystemFeedbackItem;
  moving: boolean;
  dragDisabled?: boolean;
  overlay?: boolean;
  onOpen?: () => void;
};

function FeedbackCardContent({
  item,
  moving,
  dragDisabled = false,
  overlay = false,
  onOpen,
}: FeedbackCardProps) {
  const title = item.pageTitle || "Góp ý từ một trang trong hệ thống";

  return (
    <article
      role="article"
      aria-label={`Góp ý: ${title}`}
      data-feedback-id={item.id}
      className={cn(
        "rounded-2xl border border-[#e4d8c5] bg-white p-3.5 shadow-[0_5px_16px_rgba(76,55,31,0.07)]",
        overlay && "w-[300px] rotate-1 shadow-xl",
        moving && !overlay && "opacity-55",
      )}
    >
      <div className="flex items-start gap-2">
        {!overlay ? <FeedbackDragHandle item={item} disabled={dragDisabled || moving} /> : null}
        <div className="min-w-0 flex-1">
          <div className="type-caption flex flex-wrap items-center gap-x-2 gap-y-1 font-bold text-[#786d60]">
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={13} aria-hidden="true" />
              {formatFeedbackTime(item.createdAt)}
            </span>
            {item.attachments.length ? (
              <span className="inline-flex items-center gap-1">
                <ImageIcon size={13} aria-hidden="true" />
                {item.attachments.length} ảnh
              </span>
            ) : null}
          </div>
          <h2 className="type-card-title mt-2 line-clamp-2 text-[#342f28]">{title}</h2>
        </div>
        {moving ? <LoaderCircle className="size-4 shrink-0 animate-spin text-[#b9470d]" /> : null}
      </div>

      <p className="type-supporting mt-2 line-clamp-3 min-h-[4.5rem] text-[#62584d]">{item.content}</p>

      <div className="mt-3 flex items-center gap-2 border-t border-[#eee5d8] pt-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f7f3eb] text-[#786d60]">
          <UserRound size={15} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="type-caption truncate font-black text-[#4f463b]">{item.userName}</p>
          <p className="type-caption truncate text-[#786d60]">{item.userEmail}</p>
        </div>
        {!overlay ? (
          <button
            type="button"
            onClick={onOpen}
            className="type-caption inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl border border-[#decdb3] bg-[#fffaf2] px-2.5 font-black text-[#9f3d0b] hover:bg-[#fff0df] focus-visible:ring-2 focus-visible:ring-[#c45a16] focus-visible:outline-none"
          >
            Chi tiết <ChevronRight size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function FeedbackDragHandle({ item, disabled }: { item: SystemFeedbackItem; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      aria-label={`Kéo góp ý ${item.pageTitle || item.id}`}
      disabled={disabled}
      style={{ transform: CSS.Translate.toString(transform), touchAction: "none" }}
      className={cn(
        "grid size-9 shrink-0 cursor-grab place-items-center rounded-xl border border-[#e1d4c0] bg-[#faf7f1] text-[#786d60] active:cursor-grabbing disabled:cursor-wait",
        isDragging && "opacity-0",
      )}
      {...listeners}
      {...attributes}
    >
      <GripVertical size={17} aria-hidden="true" />
    </button>
  );
}

type FeedbackColumnProps = {
  status: SystemFeedbackStatus;
  items: SystemFeedbackItem[];
  movingId?: string;
  dragDisabled: boolean;
  onOpen: (item: SystemFeedbackItem) => void;
};

function FeedbackColumn({ status, items, movingId, dragDisabled, onOpen }: FeedbackColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const styles = columnStyles[status];

  return (
    <section
      ref={setNodeRef}
      aria-label={`${systemFeedbackStatusLabels[status]}, ${items.length} góp ý`}
      className={cn(
        "flex min-h-[28rem] min-w-0 flex-col rounded-3xl border p-3 transition",
        styles.accent,
        styles.surface,
        isOver && "ring-2 ring-[#c45a16] ring-offset-2",
      )}
    >
      <header className="mb-3 flex items-center gap-2 px-1 py-1">
        <span className={cn("size-2.5 shrink-0 rounded-full", styles.dot)} aria-hidden="true" />
        <h2 className="type-action min-w-0 flex-1 font-black text-[#342f28]">
          {systemFeedbackStatusLabels[status]}
        </h2>
        <span className={cn("type-caption rounded-full border px-2.5 py-1 font-black", styles.count)}>
          {items.length}
        </span>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <FeedbackCardContent
            key={item.id}
            item={item}
            moving={movingId === item.id}
            dragDisabled={dragDisabled}
            onOpen={() => onOpen(item)}
          />
        ))}
      </div>

      {!items.length ? (
        <div className="type-supporting grid min-h-32 flex-1 place-items-center rounded-2xl border border-dashed border-[#d8cbb8] bg-white/55 p-4 text-center text-[#786d60]">
          <div>
            <MessageSquareText className="mx-auto mb-2 size-6 opacity-55" aria-hidden="true" />
            <p>Thả góp ý vào đây</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function SystemFeedbackBoard({
  items,
  movingId,
  dragDisabled,
  onMove,
  onOpen,
}: {
  items: SystemFeedbackItem[];
  movingId?: string;
  dragDisabled: boolean;
  onMove: (item: SystemFeedbackItem, status: SystemFeedbackStatus) => Promise<void>;
  onOpen: (item: SystemFeedbackItem) => void;
}) {
  const [activeItem, setActiveItem] = useState<SystemFeedbackItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragStart(event: DragStartEvent) {
    const item = event.active.data.current?.item as SystemFeedbackItem | undefined;
    setActiveItem(item ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const item = event.active.data.current?.item as SystemFeedbackItem | undefined;
    const nextStatus = event.over?.id as SystemFeedbackStatus | undefined;
    setActiveItem(null);
    if (!item || !nextStatus || !systemFeedbackStatuses.includes(nextStatus) || item.status === nextStatus) {
      return;
    }
    await onMove(item, nextStatus);
  }

  return (
    <DndContext
      id="system-feedback-board"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragCancel={() => setActiveItem(null)}
      onDragEnd={handleDragEnd}
    >
      <div
        data-testid="feedback-board-scroll"
        className="overflow-x-auto pb-3 [-webkit-overflow-scrolling:touch]"
      >
        <div className="grid min-w-max auto-cols-[minmax(280px,1fr)] grid-flow-col gap-4 xl:min-w-0 xl:grid-flow-row xl:grid-cols-4">
          {systemFeedbackStatuses.map((status) => (
            <FeedbackColumn
              key={status}
              status={status}
              items={items.filter((item) => item.status === status)}
              movingId={movingId}
              dragDisabled={dragDisabled}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeItem ? <FeedbackCardContent item={activeItem} moving={false} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
