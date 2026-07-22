"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { displayDateToIso, isoDateToDisplay, maskDisplayDate } from "@/lib/date-format";

type Props = {
  initialStatus?: string;
  initialFrom?: string;
  initialTo?: string;
  labels: {
    all: string;
    completed: string;
    inProgress: string;
    exited: string;
    submit: string;
  };
};

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="type-overline mb-1 block font-black tracking-wide text-[#6f6558] uppercase">
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder="dd/mm/yyyy"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(maskDisplayDate(event.target.value))}
        className="min-h-12 w-full rounded-xl border border-[#d9c9ae] bg-white px-3 font-bold tabular-nums outline-none focus:border-[#b9470d] focus:ring-2 focus:ring-[#f4c8ad]"
      />
    </label>
  );
}

export function ActivityFilters({ initialStatus, initialFrom, initialTo, labels }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus ?? "");
  const [from, setFrom] = useState(isoDateToDisplay(initialFrom));
  const [to, setTo] = useState(isoDateToDisplay(initialTo));
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fromIso = from ? displayDateToIso(from) : undefined;
    const toIso = to ? displayDateToIso(to) : undefined;
    if ((from && !fromIso) || (to && !toIso)) {
      setError("Ngày chưa hợp lệ. Hãy nhập đúng định dạng dd/mm/yyyy.");
      return;
    }
    if (fromIso && toIso && fromIso > toIso) {
      setError("Từ ngày không được lớn hơn đến ngày.");
      return;
    }
    setError(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (fromIso) params.set("from", fromIso);
    if (toIso) params.set("to", toIso);
    const query = params.toString();
    startTransition(() => router.push(query ? `/parent/activity?${query}` : "/parent/activity"));
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={pending}
      className="mt-5 rounded-2xl border border-[#e4d5ba] bg-white p-4 shadow-sm"
      noValidate
    >
      <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_auto]">
        <label className="block min-w-0">
          <span className="type-overline mb-1 block font-black tracking-wide text-[#6f6558] uppercase">
            Trạng thái
          </span>
          <select
            aria-label="Trạng thái hoạt động"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-[#d9c9ae] bg-white px-3 font-bold outline-none focus:border-[#b9470d] focus:ring-2 focus:ring-[#f4c8ad]"
          >
            <option value="">{labels.all}</option>
            <option value="completed">{labels.completed}</option>
            <option value="in_progress">{labels.inProgress}</option>
            <option value="exited">{labels.exited}</option>
          </select>
        </label>
        <DateField label="Từ ngày" value={from} onChange={setFrom} />
        <DateField label="Đến ngày" value={to} onChange={setTo} />
        <div className="flex items-end sm:col-span-2 xl:col-span-1">
          <Button type="submit" className="min-h-12 w-full rounded-xl px-5 py-2 xl:w-auto">
            {pending ? "Đang lọc..." : labels.submit}
          </Button>
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="type-supporting mt-3 font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
