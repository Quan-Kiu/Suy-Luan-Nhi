import Link from "next/link";
import { DatabaseZap } from "lucide-react";
import { Card } from "@/components/ui";

export default function ServiceUnavailablePage() {
  return (
    <main className="paper-texture grid min-h-screen place-items-center px-5 py-10">
      <Card className="max-w-lg p-8 text-center">
        <DatabaseZap className="mx-auto text-[#bd4910]" size={48} />
        <h1 className="mt-4 text-3xl font-black">Hệ thống đang tạm gián đoạn</h1>
        <p className="mt-3 text-[#806d54]">
          Hệ thống chưa kết nối được cơ sở dữ liệu. Thông tin gia đình vẫn được giữ nguyên; hãy thử lại sau
          khi dịch vụ hoạt động.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="" className="rounded-2xl bg-[#b9470d] px-5 py-3 font-black text-white">
            Thử kết nối lại
          </a>
          <Link href="/" className="rounded-2xl border-2 border-[#eadfc9] bg-white px-5 py-3 font-black">
            Về trang chủ
          </Link>
        </div>
      </Card>
    </main>
  );
}
