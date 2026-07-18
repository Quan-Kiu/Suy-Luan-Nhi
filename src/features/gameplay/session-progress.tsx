import { Pill } from "@/components/ui";

export function SessionProgress({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="mb-4 flex items-center gap-3" aria-label={`Tiến độ ${current} trên ${total}`}>
      <span className="grid size-9 place-items-center rounded-full bg-[#6f9e50] font-black text-white">
        {current}
      </span>
      <div
        role="progressbar"
        aria-label={`Tiến độ ${current} trên ${total}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-3 flex-1 overflow-hidden rounded-full bg-[#eadfc9]"
      >
        <div className="h-full rounded-full bg-[#6f9e50]" style={{ width: `${percentage}%` }} />
      </div>
      <Pill>
        {current}/{total}
      </Pill>
    </div>
  );
}
