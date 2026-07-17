import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, Pill } from "@/components/ui";
import { getResource } from "@/modules/parent/parent-data";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getResource(slug);
  if (!item) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Pill>{item.category}</Pill>
      <h1 className="mt-4 text-4xl font-black">{item.title}</h1>
      <p className="mt-3 text-lg text-[#806d54]">{item.excerpt}</p>
      {item.coverUrl ? (
        <Image
          src={item.coverUrl}
          width={900}
          height={500}
          alt=""
          className="mt-6 h-72 w-full rounded-[28px] object-cover"
        />
      ) : null}
      <Card className="mt-6 p-6">
        <div className="text-lg leading-8 whitespace-pre-line">{item.content}</div>
      </Card>
    </article>
  );
}
