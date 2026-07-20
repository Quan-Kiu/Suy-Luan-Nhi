import Image from "next/image";
import { notFound } from "next/navigation";
import { requireParent } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import {
  parentResourceCategoryLabels,
  parentResourceTypeLabels,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { getResource } from "@/modules/parent/parent-data";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await requireParent();
  const { slug } = await params;
  const item = await getResource(slug);
  if (!item) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2">
        <Pill>{parentResourceTypeLabels[item.resourceType as ParentResourceType]}</Pill>
        <Pill>{parentResourceCategoryLabels[item.category as ParentResourceCategory]}</Pill>
      </div>
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
      {item.resourceType === "video" && item.mediaUrl ? (
        <video
          src={item.mediaUrl}
          controls
          preload="metadata"
          poster={item.coverUrl ?? undefined}
          className="mt-6 aspect-video w-full rounded-[28px] bg-black shadow-lg"
        >
          Trình duyệt không hỗ trợ phát video này.
        </video>
      ) : null}
      <Card className="mt-6 p-6">
        <div className="text-lg leading-8 whitespace-pre-line">{item.content}</div>
      </Card>
    </article>
  );
}
