import { Brand } from "./Brand";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
        <a href="/" aria-label="DENLIFE ana sayfa"><Brand /></a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-zinc-300 md:flex">
          <a className="hover:text-[#20e878]" href="/etkinlikler?tarih=bugun">Bugün</a>
          <a className="hover:text-[#20e878]" href="/etkinlikler">Etkinlikler</a>
          <a className="hover:text-[#20e878]" href="/mekanlar">Mekanlar</a>
          <a className="hover:text-[#20e878]" href="/ulasim">Ulaşım</a>
          <a className="rounded-full bg-[#20e878] px-5 py-2.5 font-black text-black hover:bg-[#4df392]" href="/arama">Ara</a>
        </nav>
        <div className="flex gap-2 md:hidden">
          <a className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200" href="/etkinlikler">Etkinlik</a>
          <a className="rounded-full bg-[#20e878] px-3 py-2 text-xs font-black text-black" href="/mekanlar">Keşfet</a>
        </div>
      </div>
      <div className="flex border-t border-white/5 px-4 py-2 md:hidden">
        <a className="flex-1 text-center text-xs font-bold text-zinc-500" href="/etkinlikler?tarih=bugun">Bugün</a>
        <a className="flex-1 text-center text-xs font-bold text-zinc-500" href="/ulasim">Ulaşım</a>
        <a className="flex-1 text-center text-xs font-bold text-zinc-500" href="/arama">Ara</a>
      </div>
    </header>
  );
}
