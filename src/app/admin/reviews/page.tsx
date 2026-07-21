import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { requireRoles } from "@/auth/session";
import { contentTemplate, contentText } from "@/content/resolve";
import { AdminPageHeader } from "@/features/admin/admin-page-header";
import { getPendingReviews } from "@/modules/admin/mission-admin";
import { getContentNamespace } from "@/modules/content/content";

export default async function Page() {
  await requireRoles(["reviewer", "super_admin"]);
  const [items, content] = await Promise.all([getPendingReviews(), getContentNamespace("admin")]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={contentText(content, "reviews.eyebrow", "Kiểm tra nội dung")}
        title={contentText(content, "reviews.title", "Nhiệm vụ đang chờ kiểm tra")}
        description={contentText(
          content,
          "reviews.description",
          "Mở từng nhiệm vụ để xem như bé sẽ thấy, kiểm tra độ an toàn rồi xác nhận đạt yêu cầu hoặc ghi rõ phần cần sửa.",
        )}
        icon={ClipboardCheck}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={item.version.id}
            href={`/admin/reviews/${item.version.id}`}
            className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={item.coverUrl}
                fill
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 50vw, 33vw"
                loading={index === 0 ? "eager" : "lazy"}
                alt=""
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <span className="rounded-full bg-[#fff5d8] px-3 py-1 text-xs font-black">
                {contentTemplate(content, "reviews.version", "Lần gửi {number}", {
                  number: item.version.versionNumber,
                })}
              </span>
              <h2 className="mt-3 text-xl font-black">{item.title}</h2>
              <p className="text-sm text-[#806d54]">{item.worldTitle}</p>
              <p className="mt-3 text-xs text-[#806d54]">
                {contentTemplate(content, "reviews.submittedAt", "Gửi lúc {time}", {
                  time: item.version.createdAt.toLocaleString("vi-VN"),
                })}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#bd4910]">
                Mở để kiểm tra <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!items.length ? (
        <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-[#806d54]">
          {contentText(content, "reviews.empty", "Hiện không có nhiệm vụ nào cần kiểm tra.")}
        </div>
      ) : null}
    </div>
  );
}
