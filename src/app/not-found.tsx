import Link from "next/link";

export default function NotFound() {
  return (
    <main className="paper-texture grid min-h-screen place-items-center px-5">
      <section className="max-w-md text-center">
        <p className="text-6xl">🔎</p>
        <h1 className="mt-4 text-4xl font-black">Không tìm thấy manh mối này</h1>
        <p className="mt-3 text-[#806d54]">
          Trang hoặc nhiệm vụ có thể đã được lưu trữ, di chuyển hoặc chưa được mở khóa.
        </p>
        <Link href="/" className="mt-5 inline-block rounded-2xl bg-[#b9470d] px-5 py-3 font-black text-white">
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}
