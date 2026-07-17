import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingLabel?: string;
  children: ReactNode;
};

export function SubmitButton({
  pending,
  pendingLabel = "Đang xử lý...",
  children,
  disabled,
  ...props
}: Props) {
  return (
    <Button {...props} type={props.type ?? "submit"} disabled={disabled || pending} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoaderCircle className="animate-spin" size={18} />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
