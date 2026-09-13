import { supabaseAdmin } from "@/lib/supabase-admin";
import type { ImportedEvent } from "./types";

function createSlug(title: string, externalId: string) {
  return `${title}-${externalId}`
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
    .slice(0, 150);
}

export async function saveImportedEvent(
  event: ImportedEvent,
  sourceId: number
) {
  // Aynı etkinlik daha önce kaydedilmiş mi?
  const { data: existing } = await supabaseAdmin
    .from("events")
    .select("id")
    .eq("source_id", sourceId)
    .eq("slug", createSlug(event.title, event.externalId))
    .maybeSingle();

  if (existing) {
    return {
      status: "skipped",
      id: existing.id,
    };
  }

  // Kategori bul
  let categoryId: number | null = null;

  if (event.category) {
    const { data: category } = await supabaseAdmin
      .from("categories")
      .select("id")
      .ilike("name", event.category)
      .maybeSingle();

    categoryId = category?.id ?? null;
  }

  // Mekan bul veya oluştur
  let venueId: number | null = null;

  if (event.venueName) {
    const { data: existingVenue } = await supabaseAdmin
      .from("venues")
      .select("id")
      .ilike("name", event.venueName)
      .maybeSingle();

    if (existingVenue) {
      venueId = existingVenue.id;
    } else {
      const { data: newVenue, error: venueError } = await supabaseAdmin
        .from("venues")
        .insert({
          name: event.venueName,
          district: event.district ?? null,
        })
        .select("id")
        .single();

      if (venueError) {
        throw new Error(`Mekan kaydedilemedi: ${venueError.message}`);
      }

      venueId = newVenue.id;
    }
  }

  // Etkinliği kaydet
  const { data, error } = await supabaseAdmin
    .from("events")
    .insert({
      title: event.title,
      slug: createSlug(event.title, event.externalId),
      description: event.description ?? null,

      category_id: categoryId,
      venue_id: venueId,
      source_id: sourceId,

      start_at: event.startAt,
      end_at: event.endAt ?? null,

      image_url: event.imageUrl ?? null,
      ticket_url: event.ticketUrl ?? null,
      source_url: event.sourceUrl,

      is_free: event.isFree ?? false,
      status: "published",
    })
    .select("id, title")
    .single();

  if (error) {
    throw new Error(`Etkinlik kaydedilemedi: ${error.message}`);
  }

  return {
    status: "created",
    id: data.id,
    title: data.title,
  };
}