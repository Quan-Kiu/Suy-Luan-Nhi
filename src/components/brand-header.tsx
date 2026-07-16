import Image from "next/image";
import Link from "next/link";
import { Menu, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandHeader({
  backHref,
  compact = false,
  sound = false,
}: {
  backHref?: string;
  compact?: boolean;
  sound?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex h-20 items-center justify-between border-b border-[#eadfc9]/80 bg-[#fffaf0]/95 px-5",
        compact && "h-16",
      )}
    >
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Quay lại"
            className="grid size-11 place-items-center rounded-full hover:bg-[#f5ead6]"
          >
            ←
          </Link>
        ) : null}
        <Link href="/" className="flex items-center gap-2" aria-label="Trang chủ Suy Luận Nhí">
          <Image
            src="/assets/mascots/brand-logo-detective-head.png"
            width={982}
            height={1035}
            alt="Linh vật thám tử của Suy Luận Nhí"
            className="h-11 w-auto object-contain"
          />
          <span className="font-black text-[#3f321f]">Suy Luận Nhí</span>
        </Link>
      </div>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border border-[#eadfc9] bg-white"
        aria-label={sound ? "Bật hoặc tắt âm thanh" : "Mở menu"}
      >
        {sound ? <Volume2 size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}
