"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error", { message: error.message, digest: error.digest });
  }, [error]);
  return (
    <main className="paper-texture grid min-h-screen place-items-center px-5">
      <section className="max-w-md rounded-[28px] border bg-white p-7 text-center shadow-xl">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-4 text-3xl font-black">Bống bị lạc một chút</h1>
        <p className="mt-3 text-[#806d54]">Dữ liệu của gia đình vẫn an toàn. Hãy thử tải lại phần này.</p>
        <Button type="button" onClick={reset} className="mt-5 w-full">
          Thử lại
        </Button>
        {error.digest ? <p className="mt-3 text-xs text-[#9a8972]">Mã sự cố: {error.digest}</p> : null}
      </section>
    </main>
  );
}
