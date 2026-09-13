import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const quickRoutes = [
  ["Pamukkale", "Pamukkale Travertenleri"],
  ["Çamlık", "Çamlık Parkı Denizli"],
  ["Otogar", "Denizli Otogarı"],
  ["PAÜ", "Pamukkale Üniversitesi Denizli"],
  ["Laodikeia", "Laodikeia Antik Kenti"],
  ["Teleferik", "Denizli Teleferik Bağbaşı"],
];

export default function Transport() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-xs font-black tracking-[.22em] text-[#20e878]">DENLIFE ULAŞIM</p>
        <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[.95] tracking-tight md:text-7xl">
          Denizli&apos;de <span className="text-[#20e878]">yolunu bul.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Ulaşım bölümü DENLIFE içinde kalır. Hedefini seç, rota oluştur veya etkinlik ve mekan detayından konuma geç.
        </p>

        <div className="mt-12 rounded-[30px] border border-[#20e878]/20 bg-[#07110b] p-6 md:p-8">
          <p className="text-sm font-black text-[#20e878]">ROTA OLUŞTUR</p>
          <h2 className="mt-2 text-2xl font-black md:text-3xl">Nereye gitmek istiyorsun?</h2>
          <form action="https://www.google.com/maps/search/" method="get" target="_blank" className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              name="api"
              type="hidden"
              value="1"
            />
            <input
              name="query"
              required
              placeholder="Örn. Pamukkale, Çamlık Parkı, PAÜ..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-5 py-4 outline-none placeholder:text-zinc-600 focus:border-[#20e878]/50"
            />
            <button className="rounded-xl bg-[#20e878] px-7 py-4 font-black text-black hover:bg-[#4df392]">
              Rota Aç →
            </button>
          </form>
          <p className="mt-3 text-xs text-zinc-600">Rota butonu yalnızca yol tarifi için harita uygulamasını açar; belediye sitesine yönlendirme yapmaz.</p>
        </div>

        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.22em] text-[#20e878]">HIZLI ROTALAR</p>
              <h2 className="mt-2 text-3xl font-black">Sık gidilen noktalar</h2>
            </div>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickRoutes.map(([label, query]) => (
              <a
                key={label}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noreferrer"
                className="group rounded-[24px] border border-white/10 bg-[#0b0d0c] p-6 transition hover:-translate-y-1 hover:border-[#20e878]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📍</span>
                  <span className="text-zinc-700 transition group-hover:text-[#20e878]">↗</span>
                </div>
                <h3 className="mt-5 text-xl font-black">{label}</h3>
                <p className="mt-2 text-sm text-zinc-500">Yol tarifini aç</p>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Info icon="🎉" title="Etkinliğe git" text="Etkinlik detaylarında mekan bilgisi ve harita bağlantısı bulunur." href="/etkinlikler" cta="Etkinliklere Bak" />
          <Info icon="☕" title="Mekana git" text="Kafe, restoran, otel ve gezilecek yerleri DENLIFE içinde seç." href="/mekanlar" cta="Mekanları Aç" />
          <Info icon="🔎" title="Önce ara" text="İsim yazarak etkinlik ve mekanlar arasında hızlıca arama yap." href="/arama" cta="Aramayı Aç" />
        </div>

        <div className="mt-12 rounded-[28px] border border-white/10 bg-[#0b0d0c] p-8">
          <h2 className="text-2xl font-black">Toplu taşıma bilgisi</h2>
          <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
            DENLIFE&apos;ın bu ekranı başka bir siteye atmaz. Açık ve yeniden kullanılabilir gerçek zamanlı hat/durak verisi bağlandığında otobüs numarası, durak ve kalkış bilgileri doğrudan burada gösterilecek.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Info({ icon, title, text, href, cta }: { icon: string; title: string; text: string; href: string; cta: string }) {
  return (
    <a href={href} className="rounded-[28px] border border-white/10 bg-[#0b0d0c] p-7 transition hover:border-[#20e878]/40">
      <span className="text-3xl">{icon}</span>
      <h2 className="mt-5 text-xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
      <p className="mt-6 text-sm font-black text-[#20e878]">{cta} →</p>
    </a>
  );
}
