import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { Card, Pill } from "@/components/ui";
import {
  parentResourceCategoryLabels,
  parentResourceTypeLabels,
  type ParentResourceCategory,
  type ParentResourceType,
} from "@/domain/parent-resources";
import { getResource } from "@/modules/parent/parent-data";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const [, systemSettings] = await Promise.all([requireParent(), getOperationalSystemSettings()]);
  if (!systemSettings.features.parentResourcesEnabled) redirect("/parent");
  const { slug } = await params;
  if (slug === "dong-hanh-khi-be-chua-trung") {
    redirect("/parent/resources/dong-hanh-khi-be-chua-tra-loi-dung");
  }
  const item = await getResource(slug);
  if (!item) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <div className="flex flex-wrap gap-2">
        <Pill>{parentResourceTypeLabels[item.resourceType as ParentResourceType]}</Pill>
        <Pill>{parentResourceCategoryLabels[item.category as ParentResourceCategory]}</Pill>
      </div>
      <h1 className="type-page-title mt-4">{item.title}</h1>
      <p className="type-lead mt-3 text-[#786348]">{item.excerpt}</p>
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
        <div className="type-reading whitespace-pre-line">{item.content}</div>
      </Card>
    </article>
  );
}
