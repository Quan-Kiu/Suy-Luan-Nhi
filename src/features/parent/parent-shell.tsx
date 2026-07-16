import Image from "next/image";
import Link from "next/link";
import { ParentNav } from "@/features/parent/parent-nav";
export function ParentShell({
  children,
  childName,
  unread = 0,
}: {
  children: React.ReactNode;
  childName: string;
  unread?: number;
}) {
  return (
    <div className="min-h-screen bg-[#f2eadc]">
      <header className="border-b border-[#eadfc9] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <Link href="/">
            <Image
              src="/assets/mascots/brand-logo-detective-head.png"
              width={38}
              height={40}
              alt="Suy Luận Nhí"
              className="h-10 w-auto"
            />
          </Link>
          <div>
            <p className="font-black">Khu vực phụ huynh</p>
            <p className="text-xs text-[#806d54]">Đang xem: {childName}</p>
          </div>
          <Link
            href="/profiles"
            className="ml-auto rounded-full border border-[#eadfc9] px-3 py-2 text-sm font-bold"
          >
            Đổi bé
          </Link>
        </div>
      </header>
      <ParentNav unread={unread} />
      <main className="mx-auto max-w-6xl px-5 py-6 pb-24 sm:pb-10">{children}</main>
    </div>
  );
}
