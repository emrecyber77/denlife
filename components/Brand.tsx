export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="leading-none">
      <div className="text-2xl font-black tracking-[-0.05em]">
        <span className="text-white">DEN</span><span className="text-[#20e878]">LIFE</span>
      </div>
      {!compact && <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-zinc-500">DENİZLİ ŞEHİR REHBERİ</p>}
    </div>
  );
}
