import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPauEvents } from "@/lib/importers/pau";
import { getDenizliBelediyeEvents } from "@/lib/importers/denizli-belediye";
import { saveImportedEvent } from "@/lib/importers/save-event";
import { seedPlaces } from "@/lib/importers/seed-places";
import { saveImportedPlace } from "@/lib/importers/save-place";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Yetkisiz erişim." }, { status: 401 });
  }

  const report: any = { success: true, places: { created: 0, updated: 0, failed: 0 }, sources: [] };

  for (const place of seedPlaces) {
    try {
      const result = await saveImportedPlace(place);
      if (result.status === "created") report.places.created++;
      if (result.status === "updated") report.places.updated++;
    } catch {
      report.places.failed++;
    }
  }

  const importSource = async (name: string, getter: () => Promise<any[]>) => {
    const { data: source } = await supabaseAdmin.from("sources").select("id").eq("name", name).maybeSingle();
    if (!source) {
      report.sources.push({ name, success: false, error: "Kaynak kaydı bulunamadı" });
      return;
    }
    try {
      const events = await getter();
      let created = 0, skipped = 0, failed = 0;
      for (const event of events) {
        try {
          const result = await saveImportedEvent(event, source.id);
          if (result.status === "created") created++;
          else skipped++;
        } catch { failed++; }
      }
      report.sources.push({ name, success: true, found: events.length, created, skipped, failed });
    } catch (error) {
      report.sources.push({ name, success: false, error: error instanceof Error ? error.message : "Bilinmeyen hata" });
    }
  };

  await importSource("Pamukkale Üniversitesi", getPauEvents);
  await importSource("Denizli Büyükşehir Belediyesi", getDenizliBelediyeEvents);

  report.checkedAt = new Date().toISOString();
  return NextResponse.json(report);
}
