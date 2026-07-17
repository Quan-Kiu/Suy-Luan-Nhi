import { cn } from "@/lib/utils";
import { friendlyLabel, missionStatusLabels } from "@/features/admin/admin-labels";

const statusClasses: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  in_review: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-700",
  approved: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-stone-200 text-stone-700",
};

export function MissionStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-black",
        statusClasses[status] ?? "bg-[#f4ecdc] text-[#5f5548]",
        className,
      )}
    >
      {friendlyLabel(missionStatusLabels, status)}
    </span>
  );
}
