import { supabaseAdmin } from "@/lib/supabase-admin";

export type ImportedPlace = {
  name: string;
  externalId: string;
  category: string;
  description?: string | null;
  district?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  websiteUrl?: string | null;
  imageUrl?: string | null;
  openingHours?: string | null;
  sourceName: string;
  sourceUrl: string;
  featured?: boolean;
};

function slugify(value: string, externalId: string) {
  return `${value}-${externalId}`
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 170);
}

export async function saveImportedPlace(place: ImportedPlace) {
  const slug = slugify(place.name, place.externalId);
  const mapUrl =
    place.latitude != null && place.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [place.name, place.address, place.district, "Denizli"].filter(Boolean).join(" ")
        )}`;

  const payload = {
    name: place.name,
    slug,
    category: place.category,
    description: place.description ?? null,
    district: place.district ?? null,
    address: place.address ?? null,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    phone: place.phone ?? null,
    website_url: place.websiteUrl ?? null,
    maps_url: mapUrl,
    image_url: place.imageUrl ?? null,
    opening_hours: place.openingHours ?? null,
    source_name: place.sourceName,
    source_url: place.sourceUrl,
    external_id: place.externalId,
    is_featured: place.featured ?? false,
    status: "published",
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: findError } = await supabaseAdmin
    .from("places")
    .select("id")
    .eq("external_id", place.externalId)
    .eq("source_name", place.sourceName)
    .maybeSingle();

  if (findError) throw new Error(`Mekan kontrol edilemedi: ${findError.message}`);

  if (existing) {
    const { error } = await supabaseAdmin.from("places").update(payload).eq("id", existing.id);
    if (error) throw new Error(`Mekan güncellenemedi: ${error.message}`);
    return { status: "updated" as const, id: existing.id, title: place.name };
  }

  const { data, error } = await supabaseAdmin
    .from("places")
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select("id")
    .single();

  if (error) throw new Error(`Mekan kaydedilemedi: ${error.message}`);
  return { status: "created" as const, id: data.id, title: place.name };
}
