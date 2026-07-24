import { CheckCircle2, Rocket, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { ReleaseNotesSeenMarker } from "@/features/parent/release-notes-seen";
import { cn } from "@/lib/utils";
import type { ReleaseNote, ReleaseNoteKind } from "@/modules/release-notes/release-notes";

const kindLabels: Record<ReleaseNoteKind, string> = {
  feature: "Tính năng mới",
  improvement: "Cải thiện",
  fix: "Đã sửa lỗi",
  security: "Bảo mật",
};

const kindStyles: Record<ReleaseNoteKind, string> = {
  feature: "bg-[#fff0df] text-[#9f3d0b]",
  improvement: "bg-[#edf4df] text-[#50723e]",
  fix: "bg-[#eaf2ff] text-[#315f92]",
  security: "bg-[#f2eafe] text-[#67449b]",
};

function ReleaseItemIcon({ kind }: { kind: ReleaseNoteKind }) {
  if (kind === "feature") return <Rocket size={19} aria-hidden="true" />;
  if (kind === "improvement") return <Sparkles size={19} aria-hidden="true" />;
  if (kind === "security") return <ShieldCheck size={19} aria-hidden="true" />;
  return <Wrench size={19} aria-hidden="true" />;
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}
export function ReleaseNotesPage({ releases }: { releases: ReleaseNote[] }) {
  const latest = releases[0] ?? null;

  return (
    <>
      {latest ? <ReleaseNotesSeenMarker version={latest.version} /> : null}
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-3 text-[#b9470d]">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#fff0df]">
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <Pill>Có gì mới</Pill>
        </div>
        <h1 className="type-page-title">Cập nhật mới của hệ thống</h1>
        <p className="type-supporting mt-2 text-[#6f604b]">
          Theo dõi các tính năng, cải thiện và sửa lỗi mới nhất.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {releases.map((release, releaseIndex) => (
          <Card key={release.version} className="overflow-hidden">
            <div className="border-b border-[#eadfc9] bg-[#fffaf0] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{release.version}</Pill>
                {releaseIndex === 0 ? (
                  <Pill className="border-[#d98732] bg-[#fff0df] text-[#9f3d0b]">Mới nhất</Pill>
                ) : null}
                <time className="type-caption ml-auto text-[#786348]" dateTime={release.publishedAt}>
                  {formatPublishedDate(release.publishedAt)}
                </time>
              </div>
              <h2 className="type-section-title mt-3">{release.title}</h2>
              <p className="type-supporting mt-2 max-w-3xl text-[#6f604b]">{release.summary}</p>
            </div>

            <div className="divide-y divide-[#f0e6d5] px-5 sm:px-6">
              {release.items.map((item) => (
                <div key={`${item.kind}-${item.title}`} className="flex gap-3 py-5">
                  <div
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-2xl",
                      kindStyles[item.kind],
                    )}
                  >
                    <ReleaseItemIcon kind={item.kind} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-card-title">{item.title}</h3>
                      <span
                        className={cn(
                          "type-caption rounded-full px-2.5 py-1 font-bold",
                          kindStyles[item.kind],
                        )}
                      >
                        {kindLabels[item.kind]}
                      </span>
                    </div>
                    <p className="type-supporting mt-1 text-[#6f604b]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {releases.length === 0 ? (
        <Card className="mt-6 grid min-h-64 place-items-center p-6 text-center">
          <div className="max-w-md">
            <CheckCircle2 className="mx-auto text-[#50723e]" size={40} aria-hidden="true" />
            <h2 className="type-section-title mt-4">Chưa có thông báo cập nhật</h2>
            <p className="type-supporting mt-2 text-[#6f604b]">
              Các bản cập nhật mới sẽ được thông báo tại đây.
            </p>
          </div>
        </Card>
      ) : null}
    </>
  );
}
