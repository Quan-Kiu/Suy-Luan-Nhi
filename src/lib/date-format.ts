const displayDatePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function maskDisplayDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

export function displayDateToIso(value: string) {
  const match = displayDatePattern.exec(value.trim());
  if (!match) return null;
  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  if (!isValidDateParts(year, month, day)) return null;
  return `${yearValue}-${monthValue}-${dayValue}`;
}

export function isoDateToDisplay(value?: string | null) {
  if (!value) return "";
  const match = isoDatePattern.exec(value.trim());
  if (!match) return "";
  const [, yearValue, monthValue, dayValue] = match;
  if (!isValidDateParts(Number(yearValue), Number(monthValue), Number(dayValue))) return "";
  return `${dayValue}/${monthValue}/${yearValue}`;
}

export function normalizeDateQuery(value?: string | null) {
  if (!value) return undefined;
  if (isoDateToDisplay(value)) return value;
  return displayDateToIso(value) ?? undefined;
}

export function formatVietnamDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("hour")}:${part("minute")} · ${part("day")}/${part("month")}/${part("year")}`;
}
