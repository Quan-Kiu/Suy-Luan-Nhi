import Image from "next/image";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { AgeGroupCode } from "@/features/profile/age-group-options";
import { cn } from "@/lib/utils";

type Option = { id: AgeGroupCode; title: string; note: string };

export function AgeGroupCardsField({
  label,
  description,
  options,
  value,
  registration,
  error,
}: {
  label: string;
  description?: string;
  options: Option[];
  value: AgeGroupCode;
  registration: UseFormRegisterReturn;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="font-black">{label}</legend>
      {description ? <p className="mb-4 text-sm text-[#806d54]">{description}</p> : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.id}
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-3 text-center transition",
              value === option.id ? "border-[#e9641a] bg-[#fff1de]" : "border-[#eadfc9] bg-white",
            )}
          >
            <input type="radio" value={option.id} className="sr-only" {...registration} />
            <Image
              src="/assets/mascots/mascot-detective-boy-standing.png"
              width={92}
              height={92}
              alt=""
              className="mx-auto h-20 w-20 object-contain"
            />
            <strong className="block">{option.title}</strong>
            <span className="text-xs text-[#7d684f]">{option.note}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
