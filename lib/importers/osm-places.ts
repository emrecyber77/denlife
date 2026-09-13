import type { ImportedPlace } from "./save-place";

const OVERPASS_URLS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const SOURCE_NAME = "OpenStreetMap";
const SOURCE_URL = "https://www.openstreetmap.org/copyright";

// Denizli merkez + Pamukkale + Merkezefendi + Laodikeia/Honaz çevresi.
// Tüm il sınırını tek sorguda istemek 504/429 hatalarına yol açtığı için
// otomatik içe aktarma daha küçük bir alanı, kategori bazlı ve parça parça sorgular.
const DENIZLI_BBOX = "37.62,28.93,38.08,29.43";

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassJson = { elements?: OsmElement[] };

export type OsmPlacesResult = {
  places: ImportedPlace[];
  warnings: string[];
};

function categoryOf(tags: Record<string, string>) {
  if (tags.amenity === "cafe") return "kafe";
  if (["restaurant", "fast_food", "food_court"].includes(tags.amenity)) return "restoran";
  if (["hotel", "hostel", "guest_house", "motel", "apartment"].includes(tags.tourism)) return "otel";
  if (["mall", "department_store"].includes(tags.shop)) return "alisveris";
  if (["park", "garden"].includes(tags.leisure)) return "park";
  if (["sports_centre", "stadium", "fitness_centre", "swimming_pool"].includes(tags.leisure)) return "spor";
  if (tags.historic || tags.archaeological_site === "yes" || tags.tourism === "museum") return "tarihi-yer";
  if (["attraction", "viewpoint", "zoo", "theme_park", "gallery"].includes(tags.tourism)) return "gezilecek-yer";
  return "gezilecek-yer";
}

function clean(input?: string | null) {
  return input?.trim() || null;
}

function addressOf(tags: Record<string, string>) {
  const parts = [
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:suburb"],
    tags["addr:district"],
    tags["addr:city"],
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return parts || null;
}

function descriptionOf(tags: Record<string, string>, category: string) {
  if (tags.description) return tags.description;
  const labels: Record<string, string> = {
    kafe: "Denizli'de kafe.",
    restoran: "Denizli'de yeme ve içme noktası.",
    otel: "Denizli'de konaklama noktası.",
    alisveris: "Denizli'de alışveriş noktası.",
    park: "Denizli'de park ve açık alan.",
    spor: "Denizli'de spor ve aktivite noktası.",
    "tarihi-yer": "Denizli'de tarihi veya kültürel ziyaret noktası.",
    "gezilecek-yer": "Denizli'de keşfedilecek ziyaret noktası.",
  };
  return labels[category] || "Denizli şehir rehberi noktası.";
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOverpass(query: string, label: string): Promise<OverpassJson> {
  let lastError = `${label}: OpenStreetMap verisi alınamadı.`;

  for (let endpointIndex = 0; endpointIndex < OVERPASS_URLS.length; endpointIndex++) {
    const endpoint = OVERPASS_URLS[endpointIndex];

    // Her sunucuda en fazla iki kısa deneme.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent": "DENLIFE/1.0 (Denizli city guide)",
          },
          body: new URLSearchParams({ data: query }),
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        });

        if (response.ok) {
          return (await response.json()) as OverpassJson;
        }

        lastError = `${label}: HTTP ${response.status}`;

        if (response.status === 429 || response.status === 504 || response.status >= 500) {
          await wait(1200 + attempt * 1200);
          continue;
        }

        throw new Error(lastError);
      } catch (error) {
        lastError = error instanceof Error ? `${label}: ${error.message}` : lastError;
        await wait(700 + attempt * 700);
      }
    }
  }

  throw new Error(lastError);
}

function queryFor(selector: string, maxResults = 220) {
  return `
[out:json][timeout:12];
(
  ${selector}
);
out center tags qt ${maxResults};
`;
}

function buildQueries() {
  const b = DENIZLI_BBOX;
  return [
    {
      label: "yeme-icme",
      query: queryFor(`
        nwr["name"]["amenity"~"^(cafe|restaurant|fast_food|food_court)$"](${b});
      `, 260),
    },
    {
      label: "konaklama",
      query: queryFor(`
        nwr["name"]["tourism"~"^(hotel|hostel|guest_house|motel|apartment)$"](${b});
      `, 180),
    },
    {
      label: "kultur-gezi",
      query: queryFor(`
        nwr["name"]["tourism"~"^(museum|attraction|viewpoint|gallery|zoo|theme_park)$"](${b});
        nwr["name"]["historic"](${b});
        nwr["name"]["archaeological_site"="yes"](${b});
      `, 220),
    },
    {
      label: "park-spor",
      query: queryFor(`
        nwr["name"]["leisure"~"^(park|garden|sports_centre|stadium|fitness_centre|swimming_pool)$"](${b});
      `, 220),
    },
    {
      label: "alisveris",
      query: queryFor(`
        nwr["name"]["shop"~"^(mall|department_store)$"](${b});
      `, 120),
    },
  ];
}

function mapElements(elements: OsmElement[]) {
  const places: ImportedPlace[] = [];

  for (const element of elements) {
    const tags = element.tags || {};
    const name = clean(tags["name:tr"] || tags.name);
    if (!name) continue;

    const lat = element.lat ?? element.center?.lat;
    const lon = element.lon ?? element.center?.lon;
    if (lat == null || lon == null) continue;

    const category = categoryOf(tags);
    const district =
      clean(tags["addr:district"] || tags["addr:suburb"] || tags["is_in:district"] || tags["addr:city"]) ||
      "Denizli";

    places.push({
      name,
      externalId: `osm-${element.type}-${element.id}`,
      category,
      description: descriptionOf(tags, category),
      district,
      address: addressOf(tags),
      latitude: lat,
      longitude: lon,
      phone: clean(tags.phone || tags["contact:phone"]),
      websiteUrl: clean(tags.website || tags["contact:website"]),
      openingHours: clean(tags.opening_hours),
      sourceName: SOURCE_NAME,
      sourceUrl: SOURCE_URL,
      featured: ["pamukkale", "hierapolis", "laodikeia", "laodicea"].some((key) =>
        name.toLocaleLowerCase("tr-TR").includes(key)
      ),
    });
  }

  return places;
}

export async function getOsmPlacesDetailed(): Promise<OsmPlacesResult> {
  const warnings: string[] = [];
  const merged = new Map<string, ImportedPlace>();

  for (const batch of buildQueries()) {
    try {
      const json = await fetchOverpass(batch.query, batch.label);
      for (const place of mapElements(json.elements || [])) {
        merged.set(place.externalId, place);
      }
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : `${batch.label}: bilinmeyen hata`);
    }

    // Kamu servisine yük bindirmemek için kategoriler arasında kısa bekleme.
    await wait(650);
  }

  if (merged.size === 0 && warnings.length > 0) {
    throw new Error(
      `OpenStreetMap servisleri şu anda yanıt vermiyor (${warnings.join(" | ")}). Site çalışmaya devam eder; aktarımı daha sonra tekrar deneyin.`
    );
  }

  return { places: Array.from(merged.values()), warnings };
}

export async function getOsmPlaces(): Promise<ImportedPlace[]> {
  const result = await getOsmPlacesDetailed();
  return result.places;
}
