"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { getLayoutHome } from "@/lib/navigation/layout-home";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const home = getLayoutHome(pathname);
  const isPublicLayout = home.href === "/";

  useEffect(() => {
    console.error("Application error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <main
      className={`paper-texture grid place-items-center px-5 ${isPublicLayout ? "min-h-screen" : "min-h-[55vh] py-10"}`}
    >
      <section className="w-full max-w-md rounded-[28px] border bg-white p-7 text-center shadow-xl">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-4 text-3xl font-black">Bống bị lạc một chút</h1>
        <p className="mt-3 text-[#806d54]">Dữ liệu của gia đình vẫn an toàn. Hãy thử tải lại phần này.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={reset} className="w-full">
            <RotateCcw className="mr-2 inline" size={18} /> Thử lại
          </Button>
          <Link
            href={home.href}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#b9470d] px-4 py-3 font-extrabold text-[#9d3c0b] transition hover:bg-[#fff3e8]"
          >
            <ArrowLeft className="mr-2" size={18} /> {home.label}
          </Link>
        </div>
        {error.digest ? <p className="mt-3 text-xs text-[#9a8972]">Mã sự cố: {error.digest}</p> : null}
      </section>
    </main>
  );
}
