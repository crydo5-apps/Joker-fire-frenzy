import { SYMBOLS } from '@/lib/slotConfig';
import { Image } from '@/components/ui/image';

export default function Paytable({ bet }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SYMBOLS.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-black/40 p-2"
        >
          {s.image ? (
            <Image src={s.image} alt={s.label} fittingType="fit" className="h-9 w-9 shrink-0" />
          ) : (
            <span
              className="text-2xl"
              style={{ filter: `drop-shadow(0 0 6px ${s.glow})` }}
            >
              {s.icon}
            </span>
          )}
          <div className="leading-tight">
            <div className="text-[10px] font-semibold tracking-wider text-amber-200/80">
              {s.label} {s.wild ? '· WILD' : ''}
            </div>
            <div className="text-sm font-bold text-amber-300">
              ×{s.payout} <span className="text-amber-500/60">= {bet * s.payout} ₵</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}