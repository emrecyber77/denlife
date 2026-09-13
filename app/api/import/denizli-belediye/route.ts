import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { saveImportedEvent } from "@/lib/importers/save-event";
import { getDenizliBelediyeEvents } from "@/lib/importers/denizli-belediye";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (
      process.env.NODE_ENV === "production" &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz erişim.",
        },
        { status: 401 }
      );
    }

    const { data: source, error: sourceError } =
      await supabaseAdmin
        .from("sources")
        .select("id")
        .eq("name", "Denizli Büyükşehir Belediyesi")
        .single();

    if (sourceError || !source) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Denizli Büyükşehir Belediyesi kaynak kaydı bulunamadı.",
        },
        { status: 404 }
      );
    }

    const events = await getDenizliBelediyeEvents();

    let created = 0;
    let skipped = 0;
    let failed = 0;

    const results = [];

    for (const event of events) {
      try {
        const result = await saveImportedEvent(
          event,
          source.id
        );

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
      source: "Denizli Büyükşehir Belediyesi",
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
            : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}