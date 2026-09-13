import { NextRequest, NextResponse } from "next/server";
import { getOsmPlacesDetailed } from "@/lib/importers/osm-places";
import { saveImportedPlace } from "@/lib/importers/save-place";
import { seedPlaces } from "@/lib/importers/seed-places";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz erişim." },
      { status: 401 }
    );
  }

  try {
    // Önce yerleşik başlangıç verisini kaydet. Böylece dış servis kapalı olsa bile
    // DENLIFE mekan rehberi boş kalmaz.
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const place of seedPlaces) {
      try {
        const result = await saveImportedPlace(place);
        if (result.status === "created") created++;
        if (result.status === "updated") updated++;
      } catch (error) {
        failed++;
        if (errors.length < 10) {
          errors.push(error instanceof Error ? `${place.name}: ${error.message}` : `${place.name}: bilinmeyen hata`);
        }
      }
    }

    let liveFound = 0;
    let warnings: string[] = [];

    // OpenStreetMap zenginleştirmesi best-effort: 429/504 siteyi veya importu bozmaz.
    try {
      const live = await getOsmPlacesDetailed();
      liveFound = live.places.length;
      warnings = live.warnings;

      for (const place of live.places) {
        try {
          const result = await saveImportedPlace(place);
          if (result.status === "created") created++;
          if (result.status === "updated") updated++;
        } catch (error) {
          failed++;
          if (errors.length < 10) {
            errors.push(error instanceof Error ? `${place.name}: ${error.message}` : `${place.name}: bilinmeyen hata`);
          }
        }
      }
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? error.message
          : "OpenStreetMap zenginleştirmesi geçici olarak kullanılamıyor."
      );
    }

    return NextResponse.json({
      success: true,
      source: "DENLIFE başlangıç verisi + OpenStreetMap",
      seedFound: seedPlaces.length,
      liveFound,
      created,
      updated,
      failed,
      partial: warnings.length > 0,
      warnings,
      checkedAt: new Date().toISOString(),
      errors,
      note: liveFound === 0
        ? "OpenStreetMap geçici olarak yanıt vermedi; başlangıç mekanları yine de otomatik yüklendi."
        : "Başlangıç ve canlı mekan verileri senkronize edildi.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}
