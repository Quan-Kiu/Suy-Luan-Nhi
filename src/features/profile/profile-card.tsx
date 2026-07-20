import { Pencil, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

export type ProfileListItem = {
  id: string;
  displayName: string;
  ageGroup: string;
  avatarUrl: string;
  currentRank: string;
};

type ProfileCardProps = {
  profile: ProfileListItem;
  pending: boolean;
  labels: { ageGroup: string; edit: string; delete: string; enterMap: string };
  onSelect: () => void;
  onDelete: () => void;
};
export function ProfileCard({ profile, pending, labels, onSelect, onDelete }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-4 p-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:p-5">
        <Image
          src={profile.avatarUrl}
          width={88}
          height={88}
          alt={`Avatar của ${profile.displayName}`}
          className="size-[76px] rounded-full bg-[#f1eadc] object-contain sm:size-[88px]"
        />
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-black text-[#342f28]">{profile.displayName}</h2>
          <p className="mt-1 text-sm leading-5 font-bold text-[#6f604b]">
            {labels.ageGroup} {profile.ageGroup} tuổi
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#806d54]">{profile.currentRank}</p>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_48px_48px] gap-2 border-t border-[#eadfc9] bg-[#fffdf8] p-4 sm:grid-cols-[minmax(180px,1fr)_auto_auto]">
        <Button
          type="button"
          onClick={onSelect}
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center"
        >
          <Play size={18} className="mr-2" />
          {labels.enterMap}
        </Button>
        <Link
          aria-label={`${labels.edit} ${profile.displayName}`}
          href={`/profiles/${profile.id}/edit`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d9c9ae] bg-white px-3 font-black text-[#4f463b]"
        >
          <Pencil size={18} />
          <span className="hidden sm:inline">{labels.edit}</span>
        </Link>
        <button
          aria-label={`${labels.delete} ${profile.displayName}`}
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 font-black text-red-700 disabled:opacity-50"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">{labels.delete}</span>
        </button>
      </div>
    </Card>
  );
}
