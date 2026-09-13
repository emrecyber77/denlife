import * as cheerio from "cheerio";
import type { ImportedEvent } from "./types";

const BASE_URL = "https://www.denizli.bel.tr";
const EVENTS_URL =
  "https://www.denizli.bel.tr/Default.aspx?k=gosteri-ve-etkinlikler";

const months: Record<string, number> = {
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

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "DENLIFE/1.0",
      Accept: "text/html",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function parseFutureDate(text: string): string | null {
  const matches = [
    ...text.toLocaleLowerCase("tr-TR").matchAll(
      /(\d{1,2})\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s+(\d{4})/g
    ),
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const match of matches) {
    const day = Number(match[1]);
    const month = months[match[2]];
    const year = Number(match[3]);

    const dateString =
      `${year}-` +
      `${String(month).padStart(2, "0")}-` +
      `${String(day).padStart(2, "0")}T00:00:00+03:00`;

    if (new Date(dateString) >= today) {
      return dateString;
    }
  }

  return null;
}

function detectCategory(text: string): string {
  const lower = text.toLocaleLowerCase("tr-TR");

  if (lower.includes("konser")) return "Konser";
  if (lower.includes("tiyatro")) return "Tiyatro";
  if (lower.includes("festival")) return "Festival";
  if (lower.includes("sinema")) return "Sinema";
  if (lower.includes("sergi")) return "Sergi";
  if (lower.includes("spor")) return "Spor";
  if (lower.includes("çocuk")) return "Çocuk";
  if (lower.includes("atölye")) return "Atölye";
  if (lower.includes("söyleşi")) return "Söyleşi";

  return "Diğer";
}

async function parseDetail(
  sourceUrl: string,
  fallbackTitle: string
): Promise<ImportedEvent | null> {
  try {
    const html = await fetchHtml(sourceUrl);
    const $ = cheerio.load(html);

    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    const startAt = parseFutureDate(bodyText);

    if (!startAt) return null;

    const title =
      $("h1").first().text().replace(/\s+/g, " ").trim() ||
      $("h2").first().text().replace(/\s+/g, " ").trim() ||
      fallbackTitle;

    if (!title || title.length < 4) return null;

    const url = new URL(sourceUrl);

    return {
      title,
      externalId:
        url.searchParams.get("id") || sourceUrl,
      startAt,
      category: detectCategory(
        `${title} ${bodyText.slice(0, 2000)}`
      ),
      venueName: "Denizli",
      district: "Denizli",
      sourceUrl,
      isFree: bodyText
        .toLocaleLowerCase("tr-TR")
        .includes("ücretsiz"),
    };
  } catch {
    return null;
  }
}

export async function getDenizliBelediyeEvents(): Promise<
  ImportedEvent[]
> {
  const html = await fetchHtml(EVENTS_URL);
  const $ = cheerio.load(html);

  const links = new Map<string, string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    const title = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!href || !title) return;

    if (
      href.includes("Default.aspx") &&
      href.includes("id=")
    ) {
      try {
        const url = new URL(href, BASE_URL).toString();

        if (!links.has(url)) {
          links.set(url, title);
        }
      } catch {
        return;
      }
    }
  });

  // İlk aşamada en fazla 12 içerik kontrol ediyoruz.
  const candidates = Array.from(links.entries()).slice(0, 12);

  // Aynı anda 4'er sayfa kontrol edilir.
  const events: ImportedEvent[] = [];

  for (let i = 0; i < candidates.length; i += 4) {
    const batch = candidates.slice(i, i + 4);

    const results = await Promise.all(
      batch.map(([url, title]) =>
        parseDetail(url, title)
      )
    );

    for (const result of results) {
      if (result) {
        events.push(result);
      }
    }
  }

  return events;
}