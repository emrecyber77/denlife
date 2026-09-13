import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { matchesDateFilter, type DateFilter } from "@/lib/date";

export const dynamic = "force-dynamic";

const filters: Array<[DateFilter, string]> = [
  ["tum", "Tümü"],
  ["bugun", "Bugün"],
  ["yarin", "Yarın"],
  ["haftasonu", "Hafta Sonu"],
  ["buhafta", "Bu Hafta"],
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tarih?: string; kategori?: string }>;
}) {
  const params = await searchParams;
  const dateFilter = (filters.some(([key]) => key === params.tarih) ? params.tarih : "tum") as DateFilter;
  const categoryFilter = params.kategori?.trim() || "";

  const { data, error } = await supabase
    .from("events")
    .select(`
      id,title,slug,start_at,image_url,ticket_url,source_url,is_free,
      categories(name,icon,slug),venues(name,district)
    `)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(200);

  const raw = data || [];
  const events = raw.filter((event: any) => {
    const category = Array.isArray(event.categories) ? event.categories[0] : event.categories;
    const dateOk = matchesDateFilter(event.start_at, dateFilter);
    const categoryOk = !categoryFilter || category?.slug === categoryFilter;
    return dateOk && categoryOk;
  });

  const categories = Array.from(
    new Map(
      raw
        .map((event: any) => (Array.isArray(event.categories) ? event.categories[0] : event.categories))
        .filter(Boolean)
        .map((c: any) => [c.slug, c])
    ).values()
  ) as any[];

  const makeHref = (dateValue: string, categoryValue = categoryFilter) => {
    const q = new URLSearchParams();
    if (dateValue !== "tum") q.set("tarih", dateValue);
    if (categoryValue) q.set("kategori", categoryValue);
    const query = q.toString();
    return query ? `/etkinlikler?${query}` : "/etkinlikler";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-black tracking-[.22em] text-[#20e878]">DENİZLİ TAKVİMİ</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">
          Denizli&apos;de <span className="text-[#20e878]">ne var?</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
          Bugün, yarın, hafta sonu ve önümüzdeki günlerdeki etkinlikleri tek ekranda bul.
        </p>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {filters.map(([key, label]) => (
            <a
              key={key}
              href={makeHref(key)}
              className={`${dateFilter === key ? "bg-[#20e878] text-black" : "border border-white/10 bg-[#0b0d0c] text-zinc-300"} whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-black`}
            >
              {label}
            </a>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <a
              href={makeHref(dateFilter, "")}
              className={`${!categoryFilter ? "border-[#20e878]/40 text-[#20e878]" : "border-white/10 text-zinc-500"} whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold`}
            >
              Tüm kategoriler
            </a>
            {categories.map((category: any) => (
              <a
                key={category.slug}
                href={makeHref(dateFilter, category.slug)}
                className={`${categoryFilter === category.slug ? "border-[#20e878]/40 text-[#20e878]" : "border-white/10 text-zinc-500"} whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold`}
              >
                {category.icon} {category.name}
              </a>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
            Etkinlikler yüklenemedi: {error.message}
          </div>
        )}

        {!error && (
          <p className="mt-8 text-sm text-zinc-600">{events.length} etkinlik gösteriliyor</p>
        )}

        {events.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : !error ? (
          <div className="mt-10 rounded-[28px] border border-dashed border-white/10 bg-white/[.02] p-10 text-zinc-500">
            Seçtiğin tarihte etkinlik bulunamadı. Farklı bir tarih filtresi deneyebilirsin.
          </div>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
