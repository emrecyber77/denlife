import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlaceCard } from "@/components/PlaceCard";

export const dynamic = "force-dynamic";

const cats = [
  ["", "Tümü"],
  ["restoran", "Yeme & İçme"],
  ["kafe", "Kafeler"],
  ["gezilecek-yer", "Gezilecek Yerler"],
  ["tarihi-yer", "Tarihi Yerler"],
  ["park", "Parklar"],
  ["spor", "Spor & Aktivite"],
  ["otel", "Konaklama"],
  ["alisveris", "Alışveriş"],
];

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; q?: string; ilce?: string }>;
}) {
  const params = await searchParams;
  const kategori = params.kategori || "";
  const term = params.q?.trim() || "";
  const district = params.ilce?.trim() || "";

  let query = supabase
    .from("places")
    .select("id,name,slug,category,description,district,image_url,is_featured,address")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(500);

  if (kategori) query = query.eq("category", kategori);
  if (district) query = query.eq("district", district);
  if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,district.ilike.%${term}%,address.ilike.%${term}%`);

  const [{ data: places, error }, { data: districtsData }] = await Promise.all([
    query,
    supabase.from("places").select("district").eq("status", "published").not("district", "is", null).limit(500),
  ]);

  const districts = Array.from(new Set((districtsData || []).map((x: any) => x.district).filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b), "tr"));

  const categoryHref = (slug: string) => {
    const q = new URLSearchParams();
    if (slug) q.set("kategori", slug);
    if (term) q.set("q", term);
    if (district) q.set("ilce", district);
    const text = q.toString();
    return text ? `/mekanlar?${text}` : "/mekanlar";
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-black tracking-[.22em] text-[#20e878]">ŞEHİR REHBERİ</p>
        <h1 className="mt-3 text-5xl font-black tracking-tight md:text-7xl">Denizli&apos;yi <span className="text-[#20e878]">keşfet.</span></h1>
        <p className="mt-5 max-w-2xl text-zinc-400">Yeme içme, kafeler, parklar, spor, tarihi noktalar, gezilecek yerler, konaklama ve alışveriş tek yerde.</p>

        <form className="mt-9 grid gap-3 rounded-[24px] border border-white/10 bg-[#0b0d0c] p-3 md:grid-cols-[1fr_220px_auto]">
          {kategori && <input type="hidden" name="kategori" value={kategori} />}
          <input name="q" defaultValue={term} placeholder="Mekan, semt veya yer ara..." className="rounded-xl border border-white/10 bg-black px-4 py-3 outline-none placeholder:text-zinc-600 focus:border-[#20e878]/40" />
          <select name="ilce" defaultValue={district} className="rounded-xl border border-white/10 bg-black px-4 py-3 text-zinc-300 outline-none focus:border-[#20e878]/40">
            <option value="">Tüm ilçeler</option>
            {districts.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="rounded-xl bg-[#20e878] px-6 py-3 font-black text-black">Filtrele</button>
        </form>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
          {cats.map(([slug, name]) => (
            <a key={name} href={categoryHref(slug)} className={`${(!kategori && !slug) || kategori === slug ? "bg-[#20e878] text-black" : "border border-white/10 bg-[#0b0d0c] text-zinc-300"} whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-black`}>
              {name}
            </a>
          ))}
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-amber-200">Mekan verileri yüklenemedi: {error.message}</div>
        ) : places?.length ? (
          <>
            <p className="mt-8 text-sm text-zinc-600">{places.length} kayıt gösteriliyor</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{places.map((place: any) => <PlaceCard key={place.id} place={place} />)}</div>
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 p-8 text-zinc-500">Bu filtrelere uygun mekan bulunamadı.</div>
        )}

        <p className="mt-10 text-xs leading-5 text-zinc-700">Mekan verilerinin bir bölümü © OpenStreetMap katkıcılarından alınabilir ve ODbL kapsamında kullanılır. Resmi turizm verilerinde kaynak bağlantısı ayrıca gösterilir.</p>
      </section>
      <Footer />
    </main>
  );
}
