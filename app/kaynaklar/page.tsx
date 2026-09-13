import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SourcesPage() {
  const sources = [
    ["Pamukkale Üniversitesi", "Etkinlik duyuruları", "https://www.pau.edu.tr/"],
    ["Denizli Büyükşehir Belediyesi", "Kültür ve etkinlik duyuruları", "https://www.denizli.bel.tr/"],
    ["T.C. Kültür ve Turizm Bakanlığı / Denizli", "Müze, ören yeri ve turizm bilgileri", "https://denizli.ktb.gov.tr/"],
    ["OpenStreetMap katkıcıları", "Mekan ve konum zenginleştirmesi", "https://www.openstreetmap.org/copyright"],
  ];
  return <main className="min-h-screen bg-black text-white"><Header/><section className="mx-auto max-w-5xl px-6 py-16"><p className="text-xs font-black tracking-[.22em] text-[#20e878]">ŞEFFAFLIK</p><h1 className="mt-3 text-5xl font-black md:text-7xl">Veri kaynakları</h1><p className="mt-5 max-w-3xl leading-8 text-zinc-400">DENLIFE, mümkün olduğunca resmi ve açık kaynaklardan veri kullanır. Bilet ve resmi detaylarda kullanıcı asıl kaynağa yönlendirilir.</p><div className="mt-10 space-y-4">{sources.map(([name,desc,url])=><div key={name} className="rounded-[24px] border border-white/10 bg-[#0b0d0c] p-6"><h2 className="text-xl font-black">{name}</h2><p className="mt-2 text-zinc-500">{desc}</p><a className="mt-4 inline-block text-sm font-bold text-[#20e878]" href={url} target="_blank" rel="noreferrer">Kaynağı aç ↗</a></div>)}</div></section><Footer/></main>;
}
