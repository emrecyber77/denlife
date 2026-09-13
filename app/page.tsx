import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { PlaceCard } from "@/components/PlaceCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const [{ data: events }, { data: places }] = await Promise.all([
    supabase.from("events").select(`id,title,slug,start_at,image_url,ticket_url,source_url,is_free,categories(name,icon),venues(name,district)`).eq("status","published").gte("start_at",now.toISOString()).order("start_at",{ascending:true}).limit(6),
    supabase.from("places").select("id,name,slug,category,description,district,image_url,is_featured").eq("status","published").order("is_featured",{ascending:false}).limit(6),
  ]);

  return <main className="min-h-screen bg-black text-white"><Header />
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="hero-grid absolute inset-0 opacity-60"/>
      <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#20e878]/10 blur-[120px]"/>
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#20e878]/25 bg-[#20e878]/10 px-4 py-2 text-sm font-bold text-[#20e878]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#20e878]"/> Denizli şimdi burada</div>
          <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-[-.055em] md:text-8xl">Bugün Denizli&apos;de<br/><span className="text-[#20e878]">ne var?</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">Etkinlikler, mekanlar, gezilecek yerler ve şehirde işine yarayacak bilgiler tek yerde.</p>
          <form action="/arama" className="mt-10 flex max-w-2xl gap-2 rounded-2xl border border-white/10 bg-white/[.04] p-2"><input name="q" className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none placeholder:text-zinc-600" placeholder="Konser, kafe, Pamukkale..."/><button className="rounded-xl bg-[#20e878] px-6 font-black text-black hover:bg-[#4df392]">Ara</button></form>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
            <a href="/etkinlikler?tarih=bugun" className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-zinc-300 hover:border-[#20e878]/40 hover:text-[#20e878]">Bugün</a>
            <a href="/etkinlikler?tarih=yarin" className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-zinc-300 hover:border-[#20e878]/40 hover:text-[#20e878]">Yarın</a>
            <a href="/etkinlikler?tarih=haftasonu" className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-zinc-300 hover:border-[#20e878]/40 hover:text-[#20e878]">Hafta Sonu</a>
            <a href="/mekanlar" className="rounded-full border border-white/10 bg-white/[.03] px-4 py-2 text-zinc-300 hover:border-[#20e878]/40 hover:text-[#20e878]">Şehri Keşfet</a>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-20"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[.22em] text-[#20e878]">BUGÜN & YAKINDA</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Kaçırmaman gerekenler</h2></div><a href="/etkinlikler" className="text-sm font-bold text-[#20e878]">Tümünü gör →</a></div>{events?.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{events.map((e:any)=><EventCard key={e.id} event={e}/>)}</div>:<Empty text="Yaklaşan etkinlikler resmi kaynaklardan otomatik olarak güncellenecek."/>}</section>

    <section className="border-y border-white/5 bg-[#070907] py-20"><div className="mx-auto max-w-7xl px-6"><p className="text-xs font-black tracking-[.22em] text-[#20e878]">KEŞFET</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Bugün ne yapmak istiyorsun?</h2><div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">{[["🎉","Etkinlik","/etkinlikler"],["🍽️","Yeme & İçme","/mekanlar?kategori=restoran"],["☕","Kafeler","/mekanlar?kategori=kafe"],["🌿","Gezilecek Yerler","/mekanlar?kategori=gezilecek-yer"],["🏛️","Tarihi Yerler","/mekanlar?kategori=tarihi-yer"],["🏨","Konaklama","/mekanlar?kategori=otel"],["🛍️","Alışveriş","/mekanlar?kategori=alisveris"],["🚌","Ulaşım","/ulasim"]].map(([i,n,h])=><a key={n} href={h} className="rounded-2xl border border-white/10 bg-black p-6 transition hover:-translate-y-1 hover:border-[#20e878]/40"><span className="text-2xl">{i}</span><p className="mt-5 font-black">{n}</p><p className="mt-1 text-xs text-zinc-600">Keşfet →</p></a>)}</div></div></section>

    <section className="mx-auto max-w-7xl px-6 py-20"><div className="mb-8 flex items-end justify-between"><div><p className="text-xs font-black tracking-[.22em] text-[#20e878]">DENİZLİ REHBERİ</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Öne çıkan mekanlar</h2></div><a href="/mekanlar" className="text-sm font-bold text-[#20e878]">Tüm mekanlar →</a></div>{places?.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{places.map((p:any)=><PlaceCard key={p.id} place={p}/>)}</div>:<Empty text="Mekan rehberi kurulum SQL'i ile otomatik olarak başlangıç verileriyle dolar."/>}</section>

    <section className="mx-auto max-w-7xl px-6 pb-20"><div className="overflow-hidden rounded-[32px] border border-[#20e878]/20 bg-[#0b160f] p-8 md:p-12"><p className="text-sm font-black text-[#20e878]">DENLIFE ŞEHİR MODU</p><div className="mt-3 grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><h2 className="text-3xl font-black md:text-5xl">Nereye gideceğini bul.<br/>Şehirde zaman kaybetme.</h2><p className="mt-4 max-w-xl text-zinc-400">Ulaşım sayfası DENLIFE içinde kalır. Yalnızca rota istediğinde harita uygulaması açılır.</p></div><a href="/ulasim" className="rounded-xl bg-[#20e878] px-7 py-4 text-center font-black text-black">Ulaşımı Aç →</a></div></div></section>
    <Footer />
  </main>;
}

function Empty({text}:{text:string}){return <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[.02] p-10 text-zinc-500">{text}</div>}
