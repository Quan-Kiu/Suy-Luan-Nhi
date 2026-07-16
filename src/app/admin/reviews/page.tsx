import Image from "next/image";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { getPendingReviews } from "@/modules/admin/mission-admin";

export default async function Page() {
  const items = await getPendingReviews();
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#fff0df] text-[#d95812]">
          <ClipboardCheck />
        </span>
        <div>
          <p className="text-sm text-[#806d54]">Review queue</p>
          <h1 className="text-3xl font-black">Nhiệm vụ chờ duyệt</h1>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.version.id}
            href={`/admin/reviews/${item.version.id}`}
            className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            <Image src={item.coverUrl} width={560} height={300} alt="" className="h-44 w-full object-cover" />
            <div className="p-4">
              <span className="rounded-full bg-[#fff5d8] px-3 py-1 text-xs font-black">
                Version {item.version.versionNumber}
              </span>
              <h2 className="mt-3 text-xl font-black">{item.title}</h2>
              <p className="text-sm text-[#806d54]">{item.worldTitle}</p>
              <p className="mt-3 text-xs text-[#806d54]">
                Gửi lúc {item.version.createdAt.toLocaleString("vi-VN")}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {!items.length ? (
        <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-[#806d54]">
          Không có nhiệm vụ đang chờ duyệt.
        </div>
      ) : null}
    </div>
  );
}
