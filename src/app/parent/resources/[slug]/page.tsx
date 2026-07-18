import Image from "next/image";
import { notFound } from "next/navigation";
import { requireParent } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import { getResource } from "@/modules/parent/parent-data";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireParent();
  const { slug } = await params;
  const item = await getResource(slug);
  if (!item) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Pill>{item.category}</Pill>
      <h1 className="mt-4 text-4xl font-black">{item.title}</h1>
      <p className="mt-3 text-lg text-[#786348]">{item.excerpt}</p>
      {item.coverUrl ? (
        <div className="relative mt-6 h-72 w-full overflow-hidden rounded-[28px]">
          <Image
            src={item.coverUrl}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            preload
            alt=""
            className="object-cover"
          />
        </div>
      ) : null}
      <Card className="mt-6 p-6">
        <div className="text-lg leading-8 whitespace-pre-line">{item.content}</div>
      </Card>
    </article>
  );
}
