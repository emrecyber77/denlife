const labels: Record<string,[string,string]> = {
  restoran:["🍽️","Yeme & İçme"],
  kafe:["☕","Kafe"],
  "gezilecek-yer":["🌿","Gezilecek Yer"],
  "tarihi-yer":["🏛️","Tarihi Yer"],
  otel:["🏨","Konaklama"],
  alisveris:["🛍️","Alışveriş"],
  park:["🌳","Park"],
  spor:["🏃","Spor & Aktivite"],
};
export function PlaceCard({ place }: { place: any }) {
  const [icon,label] = labels[place.category] || ["📍","Mekan"];
  return <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d0c] transition hover:-translate-y-1 hover:border-[#20e878]/40">
    <a href={`/mekan/${place.slug}`}><div className="relative h-52 bg-[#101512] bg-cover bg-center" style={{backgroundImage:place.image_url?`linear-gradient(to top,rgba(0,0,0,.9),transparent),url(${place.image_url})`:"radial-gradient(circle at 75% 25%,rgba(32,232,120,.2),transparent 35%),linear-gradient(135deg,#111,#07150d)"}}><span className="absolute bottom-5 left-5 rounded-full bg-[#20e878] px-3 py-1.5 text-xs font-black text-black">{icon} {label}</span>{place.is_featured && <span className="absolute right-5 top-5 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-[#20e878]">★ Öne Çıkan</span>}</div></a>
    <div className="p-6"><a href={`/mekan/${place.slug}`}><h3 className="text-xl font-black group-hover:text-[#20e878]">{place.name}</h3></a><p className="mt-3 text-sm text-zinc-500">📍 {place.district || "Denizli"}</p>{place.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-400">{place.description}</p>}<a href={`/mekan/${place.slug}`} className="mt-6 block rounded-xl border border-white/10 py-3 text-center text-sm font-bold hover:border-[#20e878]/50 hover:text-[#20e878]">İncele →</a></div>
  </article>;
}
