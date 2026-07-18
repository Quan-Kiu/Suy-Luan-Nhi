import type { LucideIcon } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff0df] text-[#bd4910]">
            <Icon size={22} />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-sm font-bold text-[#756b60]">{eyebrow}</p> : null}
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6f6558]">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
