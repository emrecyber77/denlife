import * as cheerio from "cheerio";
import type { ImportedEvent } from "./types";

const PAU_BASE_URL = "https://www.pau.edu.tr";
const PAU_EVENTS_URL = `${PAU_BASE_URL}/pau/tr/etkinlikler`;

const turkishMonths: Record<string, number> = {
  ocak: 1,
  şubat: 2,
  mart: 3,
  nisan: 4,
  mayıs: 5,
  haziran: 6,
  temmuz: 7,
  ağustos: 8,
  eylül: 9,
  ekim: 10,
  kasım: 11,
  aralık: 12,
};

function parseTurkishDate(text: string): string | null {
  const match = text
    .toLocaleLowerCase("tr-TR")
    .match(
      /(\d{1,2})\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s+(\d{4})/
    );

  if (!match) return null;

  const day = Number(match[1]);
  const month = turkishMonths[match[2]];
  const year = Number(match[3]);

  const dayText = String(day).padStart(2, "0");
  const monthText = String(month).padStart(2, "0");

  // PAÜ liste ekranı saat vermediği için gün başlangıcı olarak kaydediyoruz.
  return `${year}-${monthText}-${dayText}T00:00:00+03:00`;
}

function findEventContainerText(element: any, $: cheerio.CheerioAPI) {
  let current = $(element);

  for (let i = 0; i < 6; i++) {
    const text = current.text().replace(/\s+/g, " ").trim();

    if (
      /\d{1,2}\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}/i.test(
        text
      )
    ) {
      return text;
    }

    current = current.parent();

    if (!current.length) break;
  }

  return "";
}

function detectCategory(text: string): string | null {
  const types = [
    "Konser",
    "Tiyatro",
    "Festival",
    "Sergi",
    "Spor",
    "Söyleşi",
    "Sempozyum",
    "Seminer",
    "Panel",
    "Konferans",
    "Çalıştay",
    "Eğitim",
    "Yarışma",
    "Etkinlik",
  ];

  const lower = text.toLocaleLowerCase("tr-TR");

  for (const type of types) {
    if (lower.includes(type.toLocaleLowerCase("tr-TR"))) {
      return type;
    }
  }

  return "Diğer";
}

export async function getPauEvents(): Promise<ImportedEvent[]> {
  const response = await fetch(PAU_EVENTS_URL, {
    headers: {
      "User-Agent": "DENLIFE/1.0",
      Accept: "text/html",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `PAÜ etkinlik sayfasına ulaşılamadı: ${response.status}`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const events: ImportedEvent[] = [];
  const seen = new Set<string>();

  $('a[href*="/etkinlik/"]').each((_, element) => {
    const anchor = $(element);

    const title = anchor.text().replace(/\s+/g, " ").trim();
    const href = anchor.attr("href");

    if (!title || !href) return;

    const sourceUrl = href.startsWith("http")
      ? href
      : new URL(href, PAU_BASE_URL).toString();

    if (seen.has(sourceUrl)) return;

    const containerText = findEventContainerText(element, $);
    const startAt = parseTurkishDate(containerText);

    if (!startAt) return;

    const eventDate = new Date(startAt);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Sadece bugün ve gelecekteki etkinlikler
    if (eventDate < today) return;

    seen.add(sourceUrl);

    const externalId =
      new URL(sourceUrl).pathname.split("/").filter(Boolean).pop() ||
      sourceUrl;

    events.push({
      title,
      externalId,
      startAt,
      category: detectCategory(containerText),
      venueName: "Pamukkale Üniversitesi",
      district: "Pamukkale",
      sourceUrl,
      isFree: false,
    });
  });

  return events;
}