import { NextRequest, NextResponse } from "next/server";
import { getPauEvents } from "@/lib/importers/pau";
import { saveImportedEvent } from "@/lib/importers/save-event";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
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

    const { data: source, error: sourceError } = await supabaseAdmin
      .from("sources")
      .select("id")
      .eq("name", "Pamukkale Üniversitesi")
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        {
          success: false,
          error: "Pamukkale Üniversitesi kaynak kaydı bulunamadı.",
        },
        { status: 404 }
      );
    }

    const events = await getPauEvents();

    let created = 0;
    let skipped = 0;
    let failed = 0;

    const results = [];

    for (const event of events) {
      try {
        const result = await saveImportedEvent(event, source.id);

        if (result.status === "created") created++;
        if (result.status === "skipped") skipped++;

        results.push({
          title: event.title,
          status: result.status,
        });
      } catch (error) {
        failed++;

        results.push({
          title: event.title,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Bilinmeyen hata",
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: "Pamukkale Üniversitesi",
      found: events.length,
      created,
      skipped,
      failed,
      checkedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Bilinmeyen hata oluştu.",
      },
      { status: 500 }
    );
  }
}