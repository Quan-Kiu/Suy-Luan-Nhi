"use client";

import { Eraser, LoaderCircle, Redo2, Save, Undo2, X } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type Point = { x: number; y: number };
type Stroke = {
  color: string;
  width: number;
  points: Point[];
};

type CanvasSize = { width: number; height: number };

type FeedbackImageAnnotatorProps = {
  file: File;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
};

const MAX_CANVAS_EDGE = 2400;
const COLORS = [
  { value: "#dc2626", label: "Đỏ" },
  { value: "#ea580c", label: "Cam" },
  { value: "#2563eb", label: "Xanh dương" },
  { value: "#111827", label: "Đen" },
] as const;
const WIDTHS = [
  { value: 0.004, label: "Mảnh" },
  { value: 0.008, label: "Vừa" },
  { value: 0.014, label: "Đậm" },
] as const;

function getCanvasSize(image: HTMLImageElement): CanvasSize {
  const scale = Math.min(1, MAX_CANVAS_EDGE / image.naturalWidth, MAX_CANVAS_EDGE / image.naturalHeight);
  return {
    width: Math.max(1, Math.round(image.naturalWidth * scale)),
    height: Math.max(1, Math.round(image.naturalHeight * scale)),
  };
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không thể mở ảnh này để đánh dấu"));
    };
    image.src = url;
  });
}

function drawStroke(context: CanvasRenderingContext2D, stroke: Stroke, size: CanvasSize) {
  if (!stroke.points.length) return;
  const lineWidth = Math.max(2, Math.min(size.width, size.height) * stroke.width);
  context.strokeStyle = stroke.color;
  context.fillStyle = stroke.color;
  context.lineWidth = lineWidth;
  context.lineCap = "round";
  context.lineJoin = "round";

  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    context.beginPath();
    context.arc(point.x * size.width, point.y * size.height, lineWidth / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }

  context.beginPath();
  stroke.points.forEach((point, index) => {
    const x = point.x * size.width;
    const y = point.y * size.height;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
}

function renderCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  size: CanvasSize,
  strokes: Stroke[],
  activeStroke: Stroke | null,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, size.width, size.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size.width, size.height);
  context.drawImage(image, 0, 0, size.width, size.height);
  strokes.forEach((stroke) => drawStroke(context, stroke, size));
  if (activeStroke) drawStroke(context, activeStroke, size);
}

function canvasToFile(canvas: HTMLCanvasElement, sourceFile: File) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Chưa thể lưu ảnh đã đánh dấu"));
          return;
        }
        const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "feedback-image";
        resolve(
          new File([blob], `${baseName}-marked.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now(),
          }),
        );
      },
      "image/jpeg",
      0.9,
    );
  });
}

export function FeedbackImageAnnotator({ file, onClose, onSave }: FeedbackImageAnnotatorProps) {
  const titleId = useId();
  const descriptionId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [size, setSize] = useState<CanvasSize | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState<(typeof COLORS)[number]["value"]>(COLORS[0].value);
  const [strokeWidth, setStrokeWidth] = useState<number>(WIDTHS[1].value);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    void loadImage(file)
      .then((loadedImage) => {
        if (cancelled) return;
        setImage(loadedImage);
        setSize(getCanvasSize(loadedImage));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Không thể mở ảnh");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, saving]);

  useEffect(() => {
    if (canvasRef.current && image && size) {
      renderCanvas(canvasRef.current, image, size, strokes, activeStroke);
    }
  }, [activeStroke, image, size, strokes]);

  const getPoint = useCallback((event: ReactPointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }, []);

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!image || !size || saving) return;
    const point = getPoint(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setRedoStack([]);
    setActiveStroke({ color, width: strokeWidth, points: [point] });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!activeStroke || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = getPoint(event);
    if (!point) return;
    setActiveStroke((current) => {
      if (!current) return null;
      const previous = current.points[current.points.length - 1];
      if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 0.0015) return current;
      return { ...current, points: [...current.points, point] };
    });
  }

  function finishStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setActiveStroke((current) => {
      if (current?.points.length) setStrokes((items) => [...items, current]);
      return null;
    });
  }

  function undo() {
    setStrokes((items) => {
      const last = items.at(-1);
      if (last) setRedoStack((redoItems) => [...redoItems, last]);
      return items.slice(0, -1);
    });
  }

  function redo() {
    setRedoStack((items) => {
      const last = items.at(-1);
      if (last) setStrokes((strokeItems) => [...strokeItems, last]);
      return items.slice(0, -1);
    });
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas || !strokes.length) return;
    setSaving(true);
    setError(undefined);
    try {
      const markedFile = await canvasToFile(canvas, file);
      await onSave(markedFile);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Chưa thể lưu ảnh đã đánh dấu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[140] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#fffdf8] shadow-2xl sm:max-w-5xl sm:rounded-[28px]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eadfc9] px-5 py-4 sm:px-6">
          <div>
            <p className="type-supporting font-bold text-[#9a6845]">Đánh dấu trên ảnh</p>
            <h2 id={titleId} className="type-section-title">
              Vẽ vào khu vực cần chúng tôi chú ý
            </h2>
            <p id={descriptionId} className="type-supporting mt-1 text-[#6f604b]">
              Dùng chuột hoặc ngón tay để khoanh, gạch chân hay chỉ vào vị trí gặp vấn đề.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng trình đánh dấu ảnh"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border hover:bg-[#f5efe4] disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-[#eadfc9] bg-[#fff8ec] p-3">
            <fieldset className="flex items-center gap-2">
              <legend className="sr-only">Màu nét vẽ</legend>
              {COLORS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setColor(item.value)}
                  aria-label={`Chọn màu ${item.label}`}
                  aria-pressed={color === item.value}
                  className="size-9 cursor-pointer rounded-full border-2 border-white shadow ring-offset-2 aria-pressed:ring-2 aria-pressed:ring-[#6f3d20]"
                  style={{ backgroundColor: item.value }}
                />
              ))}
            </fieldset>

            <fieldset className="flex items-center gap-1 rounded-xl border bg-white p-1">
              <legend className="sr-only">Độ dày nét vẽ</legend>
              {WIDTHS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStrokeWidth(item.value)}
                  aria-pressed={strokeWidth === item.value}
                  className="type-caption min-h-8 cursor-pointer rounded-lg px-2.5 font-black hover:bg-[#fff2df] aria-pressed:bg-[#f6d4aa]"
                >
                  {item.label}
                </button>
              ))}
            </fieldset>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                disabled={!strokes.length || saving}
                onClick={undo}
                aria-label="Hoàn tác nét vẽ"
                className="grid size-9 cursor-pointer place-items-center rounded-xl border bg-white hover:bg-[#fff2df] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 size={17} />
              </button>
              <button
                type="button"
                disabled={!redoStack.length || saving}
                onClick={redo}
                aria-label="Làm lại nét vẽ"
                className="grid size-9 cursor-pointer place-items-center rounded-xl border bg-white hover:bg-[#fff2df] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Redo2 size={17} />
              </button>
              <button
                type="button"
                disabled={!strokes.length || saving}
                onClick={() => {
                  setRedoStack([]);
                  setStrokes([]);
                }}
                className="type-caption inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border bg-white px-3 font-black hover:bg-[#fff2df] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Eraser size={16} /> Xóa nét vẽ
              </button>
            </div>
          </div>

          <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-[#d9c8aa] bg-[#e9e1d5]">
            {loading ? (
              <div className="type-label flex items-center gap-2 text-[#6f604b]">
                <LoaderCircle size={20} className="animate-spin" /> Đang mở ảnh...
              </div>
            ) : image && size ? (
              <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height}
                aria-label="Vùng vẽ đánh dấu trên ảnh"
                className="max-h-[62dvh] max-w-full cursor-crosshair touch-none bg-white object-contain"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
              />
            ) : (
              <p className="type-supporting p-6 text-center font-bold text-red-700">{error}</p>
            )}
          </div>
          {error && image ? (
            <p role="alert" className="type-supporting mt-3 font-bold text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#eadfc9] bg-[#fffdf8] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-12 cursor-pointer rounded-2xl border px-5 font-black hover:bg-[#f5efe4] disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!strokes.length || loading || saving}
            onClick={() => void save()}
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b94718] px-5 font-black text-white shadow-[0_5px_0_#7f2e0d] hover:bg-[#a83f14] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "Đang lưu..." : "Lưu ảnh đã đánh dấu"}
          </button>
        </footer>
      </section>
    </div>
  );
}
