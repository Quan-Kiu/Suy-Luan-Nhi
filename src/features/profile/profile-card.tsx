import Image from "next/image";
import Link from "next/link";
import { Pencil, Play, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui";

export type ProfileListItem = {
  id: string;
  displayName: string;
  ageGroup: string;
  avatarUrl: string;
  currentRank: string;
};

export function ProfileCard({
  profile,
  pending,
  labels,
  onSelect,
  onDelete,
}: {
  profile: ProfileListItem;
  pending: boolean;
  labels: { ageGroup: string; edit: string; delete: string; enterMap: string };
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Image
          src={profile.avatarUrl}
          width={84}
          height={84}
          alt={`Avatar của ${profile.displayName}`}
          className="size-20 rounded-full bg-[#f1eadc] object-contain"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-black">{profile.displayName}</h2>
          <p className="text-sm text-[#806d54]">
            {labels.ageGroup} {profile.ageGroup} · {profile.currentRank}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            aria-label={`${labels.edit} ${profile.displayName}`}
            href={`/profiles/${profile.id}/edit`}
            className="grid size-11 place-items-center rounded-xl border border-[#eadfc9] bg-white"
          >
            <Pencil size={18} />
          </Link>
          <button
            aria-label={`${labels.delete} ${profile.displayName}`}
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="grid size-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
        <Button type="button" onClick={onSelect} disabled={pending} className="hidden sm:block">
          <Play size={18} className="mr-2 inline" />
          {labels.enterMap}
        </Button>
      </div>
      <Button type="button" onClick={onSelect} disabled={pending} className="mt-4 w-full sm:hidden">
        {labels.enterMap} cùng {profile.displayName}
      </Button>
    </Card>
  );
}
