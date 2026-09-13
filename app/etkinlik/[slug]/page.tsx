import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      slug,
      description,
      start_at,
      end_at,
      image_url,
      ticket_url,
      source_url,
      price_min,
      price_max,
      is_free,
      categories (
        name,
        icon
      ),
      venues (
        name,
        district,
        address,
        maps_url
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Etkinlik detay hatası:", error);
  }

  if (!event) {
    notFound();
  }

  const category = Array.isArray(event.categories)
    ? event.categories[0]
    : event.categories;

  const venue = Array.isArray(event.venues)
    ? event.venues[0]
    : event.venues;

  const startDate = new Date(event.start_at);

  const dateText = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(startDate);

  const isMidnight =
    startDate.getUTCHours() === 21 &&
    startDate.getUTCMinutes() === 0;

  const timeText = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(startDate);

  let priceText = "Kaynakta belirtilmemiş";

  if (event.is_free) {
    priceText = "Ücretsiz";
  } else if (event.price_min) {
    priceText = `${event.price_min} TL'den başlayan`;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="text-2xl font-black tracking-tight">
            <span className="text-white">DEN</span><span className="text-[#20e878]">LIFE</span>
          </a>

          <a
            href="/"
            className="text-sm font-semibold text-slate-300 hover:text-[#20e878]"
          >
            ← Ana Sayfa
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div
          className="min-h-[320px] rounded-3xl bg-cover bg-center"
          style={{
            backgroundImage: event.image_url
              ? `linear-gradient(to top, rgba(6,24,38,.95), rgba(6,24,38,.2)), url(${event.image_url})`
              : "linear-gradient(135deg, #123C52, #071824)",
          }}
        />

        <div className="mt-8">
          <span className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-[#20e878]">
            {category?.icon || "📍"} {category?.name || "Etkinlik"}
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            {event.title}
          </h1>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard
              label="Tarih"
              value={
                isMidnight
                  ? dateText
                  : `${dateText} • ${timeText}`
              }
            />

            <InfoCard
              label="Mekan"
              value={venue?.name || venue?.district || "Denizli"}
            />

            <InfoCard
              label="Ücret"
              value={priceText}
            />
          </div>

          {event.description && (
            <div className="mt-10 rounded-3xl border border-white/10 bg-[#0b0d0c] p-8">
              <h2 className="text-2xl font-bold">Etkinlik Hakkında</h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-slate-300">
                {event.description}
              </p>
            </div>
          )}

          {venue?.address && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-[#0b0d0c] p-8">
              <h2 className="text-2xl font-bold">Konum</h2>

              <p className="mt-3 text-slate-300">
                {venue.address}
              </p>

              {venue.maps_url && (
                <a
                  href={venue.maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-xl border border-[#20e878]/30 px-5 py-3 font-semibold text-[#20e878] hover:bg-[#4df392]/10"
                >
                  Haritada Aç
                </a>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#20e878] px-7 py-4 text-center font-bold text-black hover:bg-[#4df392]"
              >
                Bilet Al
              </a>
            )}

            {event.source_url && (
              <a
                href={event.source_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/10 px-7 py-4 text-center font-semibold hover:border-[#20e878] hover:text-[#20e878]"
              >
                Resmi Kaynak
              </a>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}