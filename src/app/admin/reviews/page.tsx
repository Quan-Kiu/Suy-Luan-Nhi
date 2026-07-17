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
        title={contentText(content, "reviews.title", "Danh sách chờ kiểm duyệt")}
        description={contentText(
          content,
          "reviews.description",
          "Mở từng nhiệm vụ để xem như trẻ sẽ thấy, kiểm tra an toàn rồi duyệt hoặc ghi rõ phần cần chỉnh sửa.",
        )}
        icon={ClipboardCheck}
      />
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
                {contentTemplate(content, "reviews.version", "Lần gửi {number}", {
                  number: item.version.versionNumber,
                })}
              </span>
              <h2 className="mt-3 text-xl font-black">{item.title}</h2>
              <p className="text-sm text-[#806d54]">{item.worldTitle}</p>
              <p className="mt-3 text-xs text-[#806d54]">
                {contentTemplate(content, "reviews.submittedAt", "Được gửi lúc {time}", {
                  time: item.version.createdAt.toLocaleString("vi-VN"),
                })}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#d95812]">
                Mở để kiểm duyệt <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!items.length ? (
        <div className="mt-6 rounded-2xl border bg-white p-10 text-center text-[#806d54]">
          {contentText(content, "reviews.empty", "Không có nhiệm vụ đang chờ duyệt.")}
        </div>
      ) : null}
    </div>
  );
}
