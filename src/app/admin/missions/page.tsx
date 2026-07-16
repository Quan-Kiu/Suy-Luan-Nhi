import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { MissionListActions } from "@/features/admin/mission-list-actions";
import { getAdminTaxonomy, listAdminMissions } from "@/modules/admin/mission-admin";

const statusLabels: Record<string, string> = {
  draft: "Bản nháp",
  in_review: "Chờ duyệt",
  rejected: "Cần sửa",
  approved: "Đã duyệt",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; worldId?: string; search?: string }>;
}) {
  const filters = await searchParams;
  const [items, taxonomy] = await Promise.all([listAdminMissions(filters), getAdminTaxonomy()]);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#8a8176]">Content operations</p>
          <h1 className="text-3xl font-black">Danh sách nhiệm vụ</h1>
        </div>
        <Link
          href="/admin/missions/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e9641a] px-4 font-black text-white"
        >
          <Plus size={18} /> Tạo nhiệm vụ
        </Link>
      </div>
      <form className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_180px_180px_auto]">
        <label className="relative">
          <Search className="absolute top-3 left-3 text-[#887b6c]" size={18} />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Tìm tên hoặc slug"
            className="min-h-11 w-full rounded-xl border py-2 pr-3 pl-10"
          />
        </label>
        <select
          name="worldId"
          defaultValue={filters.worldId ?? ""}
          className="min-h-11 rounded-xl border px-3"
        >
          <option value="">Tất cả thế giới</option>
          {taxonomy.worlds.map((world) => (
            <option key={world.id} value={world.id}>
              {world.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={filters.status ?? ""} className="min-h-11 rounded-xl border px-3">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded-xl bg-[#3f392f] px-4 font-black text-white">Lọc</button>
      </form>
      <div className="mt-5 overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f7f3eb] text-left">
            <tr>
              <th className="p-3">Nhiệm vụ</th>
              <th className="p-3">Thế giới</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Nội dung</th>
              <th className="p-3">Cập nhật</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t align-middle">
                <td className="p-3">
                  <Link href={`/admin/missions/${item.id}/edit`} className="flex min-w-64 items-center gap-3">
                    <Image
                      src={item.coverUrl}
                      width={68}
                      height={52}
                      alt=""
                      className="h-13 w-17 rounded-xl object-cover"
                    />
                    <span>
                      <strong className="block">{item.title}</strong>
                      <small className="text-[#806d54]">{item.slug}</small>
                    </span>
                  </Link>
                </td>
                <td className="p-3">{item.worldTitle}</td>
                <td className="p-3">
                  <span className="rounded-full bg-[#f4ecdc] px-3 py-1 font-bold">
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </td>
                <td className="p-3">
                  {item.questionCount} câu · {item.estimatedMinutes} phút
                </td>
                <td className="p-3 text-[#806d54]">{item.updatedAt.toLocaleDateString("vi-VN")}</td>
                <td className="p-3">
                  <MissionListActions missionId={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? <p className="p-8 text-center text-[#806d54]">Không có nhiệm vụ phù hợp.</p> : null}
      </div>
    </div>
  );
}
