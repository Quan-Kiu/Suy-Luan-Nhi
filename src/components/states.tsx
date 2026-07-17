import type { ReactNode } from "react";
import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

function StateCard({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("grid place-items-center p-8 text-center", className)}>
      {icon}
      <h2 className="mt-3 text-xl font-black">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm text-[#806d54]">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

export function LoadingState({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return <StateCard icon={<LoaderCircle className="animate-spin text-[#e9641a]" />} title={label} />;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <StateCard icon={<Inbox className="text-[#806d54]" />} title={title} description={description} />;
}

export function ErrorState({
  title = "Không thể tải dữ liệu",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <StateCard
      icon={<CircleAlert className="text-red-700" />}
      title={title}
      description={description}
      action={onRetry ? <Button onClick={onRetry}>Thử lại</Button> : undefined}
    />
  );
}
