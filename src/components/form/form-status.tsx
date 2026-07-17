import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export function FormStatus({
  status,
  title,
  message,
  className,
}: {
  status: Status;
  title?: string;
  message?: string;
  className?: string;
}) {
  if (status === "idle" || (!title && !message)) return null;
  const Icon = status === "loading" ? LoaderCircle : status === "success" ? CheckCircle2 : CircleAlert;
  return (
    <div
      role={status === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex items-center gap-2 rounded-xl p-3 text-sm font-bold",
        status === "error" && "bg-red-50 text-red-700",
        status === "success" && "bg-green-50 text-green-700",
        status === "loading" && "bg-[#f5f2ec] text-[#6f6250]",
        className,
      )}
    >
      <Icon size={18} className={status === "loading" ? "animate-spin" : undefined} />
      <span>
        {title ? <strong className="block">{title}</strong> : null}
        {message ? <span className={title ? "mt-1 block font-normal" : undefined}>{message}</span> : null}
      </span>
    </div>
  );
}
