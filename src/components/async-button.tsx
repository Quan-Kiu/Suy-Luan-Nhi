import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui";

export function AsyncButton({
  pending,
  pendingLabel,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}) {
  return (
    <Button {...props} type={props.type ?? "button"} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoaderCircle size={18} className="animate-spin" />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
