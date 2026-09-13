export type DateFilter = "tum" | "bugun" | "yarin" | "haftasonu" | "buhafta";

function istanbulParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: map.weekday,
  };
}

function ymd(date: Date) {
  const p = istanbulParts(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function matchesDateFilter(startAt: string, filter: DateFilter, now = new Date()) {
  if (filter === "tum") return true;
  const eventDate = new Date(startAt);
  const eventYmd = ymd(eventDate);
  const todayYmd = ymd(now);
  if (filter === "bugun") return eventYmd === todayYmd;
  if (filter === "yarin") return eventYmd === ymd(addDays(now, 1));

  if (filter === "haftasonu") {
    const weekday = istanbulParts(eventDate).weekday;
    return (weekday === "Sat" || weekday === "Sun") && eventDate >= now;
  }

  if (filter === "buhafta") {
    const sevenDaysLater = addDays(now, 7);
    return eventDate >= now && eventDate <= sevenDaysLater;
  }

  return true;
}

export function formatEventDate(startAt: string) {
  const date = new Date(startAt);
  const dateText = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(date);
  const dateOnly = date.getUTCHours() === 21 && date.getUTCMinutes() === 0;
  return { dateText, timeText, dateOnly };
}
