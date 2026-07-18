import Image from "next/image";
import Link from "next/link";
import { requireParent } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import { getResources } from "@/modules/parent/parent-data";

export default async function Page() {
  await requireParent();
  const items = await getResources();
  return (
    <>
      <h1 className="text-3xl font-black">Tài nguyên cho phụ huynh</h1>
      <p className="mt-2 text-[#786348]">Hướng dẫn ngắn, thực tế và không tạo áp lực thành tích cho trẻ.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <Link key={item.id} href={`/parent/resources/${item.slug}`}>
            <Card className="h-full overflow-hidden transition hover:-translate-y-1">
              {item.coverUrl ? (
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={item.coverUrl}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    preload={index === 0}
                    alt=""
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="p-5">
                <Pill>{item.category}</Pill>
                <h2 className="mt-3 text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6f604b]">{item.excerpt}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
