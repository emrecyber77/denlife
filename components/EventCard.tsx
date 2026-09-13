type EventCardProps = { event: any };
export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.start_at);
  const category = Array.isArray(event.categories) ? event.categories[0] : event.categories;
  const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
  const dateText = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", timeZone: "Europe/Istanbul" }).format(date);
  const timeText = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(date);
  const dateOnly = date.getUTCHours() === 21 && date.getUTCMinutes() === 0;
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0d0c] transition hover:-translate-y-1 hover:border-[#20e878]/40">
      <a href={`/etkinlik/${event.slug}`} className="block">
        <div className="relative flex h-48 items-end overflow-hidden bg-[#101512] p-5" style={{ backgroundImage: event.image_url ? `linear-gradient(to top,rgba(0,0,0,.92),rgba(0,0,0,.15)),url(${event.image_url})` : "radial-gradient(circle at 80% 20%,rgba(32,232,120,.18),transparent 40%),linear-gradient(135deg,#111,#07150d)", backgroundSize: "cover", backgroundPosition: "center" }}>
          <span className="rounded-full bg-[#20e878] px-3 py-1.5 text-xs font-black text-black">{category?.icon || "●"} {category?.name || "ETKİNLİK"}</span>
        </div>
      </a>
      <div className="p-6">
        <p className="text-sm font-bold text-[#20e878]">{dateText}{!dateOnly && ` • ${timeText}`}</p>
        <a href={`/etkinlik/${event.slug}`}><h3 className="mt-2 text-xl font-black leading-snug text-white transition group-hover:text-[#20e878]">{event.title}</h3></a>
        <p className="mt-4 text-sm text-zinc-500">📍 {venue?.name || venue?.district || "Denizli"}</p>
        <div className="mt-6 flex gap-2"><a className="flex-1 rounded-xl border border-white/10 py-3 text-center text-sm font-bold hover:border-[#20e878]/50" href={`/etkinlik/${event.slug}`}>Detay</a>{event.ticket_url && <a className="flex-1 rounded-xl bg-[#20e878] py-3 text-center text-sm font-black text-black" href={event.ticket_url} target="_blank" rel="noreferrer">Bilet</a>}</div>
      </div>
    </article>
  );
}
