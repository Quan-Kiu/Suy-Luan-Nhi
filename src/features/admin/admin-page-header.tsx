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
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#bd4910]">
            <Icon size={20} />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-sm font-bold text-[#756b60]">{eyebrow}</p> : null}
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-5 text-[#6f6558]">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
