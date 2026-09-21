import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, RotateCcw, Info, X, Coins, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useSlotGame } from '@/lib/useSlotGame';
import {
  BET_OPTIONS,
  REEL_DELAYS,
  FREE_SPINS_AWARD,
  FREE_SPINS_MULTIPLIER,
  BUY_FEATURE_MULTIPLIER,
  PAYLINES,
} from '@/lib/slotConfig';
import Reel from './Reel';
import Paytable from './Paytable';

export default function SlotMachine() {
  const {
    balance, bet, changeBet, grid, spinning, lastWin, winInfo, stats, spin, resetBalance,
    freeSpins, freeSpinsAwarded, buyFreeSpins,
  } = useSlotGame();
  const [showPaytable, setShowPaytable] = useState(false);
  const inFreeSpins = freeSpins > 0;

  const canSpin = !spinning && (inFreeSpins || balance >= bet);
  const buyCost = bet * BUY_FEATURE_MULTIPLIER;
  const canBuy = !spinning && !inFreeSpins && balance >= buyCost;

  // ✨ Highlight-Map: für jede Walze die gewonnenen Zeilen-Indizes
  const highlightByReel = useMemo(() => {
    const map = [[], [], []]; // reel 0, 1, 2
    if (!winInfo?.winningLines?.length) return map;

    for (const line of winInfo.winningLines) {
      const payline = PAYLINES.find((p) => p.id === line.paylineId);
      if (!payline) continue;
      for (const [reel, row] of payline.cells) {
        if (!map[reel].includes(row)) map[reel].push(row);
      }
    }
    return map;
  }, [winInfo]);

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-8">
      {/* ... Titel + Freispiele-Banner + Stat-Leiste bleiben unverändert ... */}

      {/* Walzenfenster */}
      <div
        className="relative w-full rounded-3xl p-3 sm:p-5"
        style={{
          background: 'linear-gradient(180deg, #3a1408 0%, #1a0703 100%)',
          boxShadow:
            '0 0 0 3px #b8860b, 0 0 0 6px #5c3a0e, 0 24px 60px rgba(255,80,20,0.25), inset 0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Alte einzelne Payline-Linie kann man optional entfernen oder behalten */}
        <div
          className="pointer-events-none absolute left-3 right-3 top-1/2 z-20 -translate-y-1/2 rounded-full"
          style={{
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #ff3b3b 20%, #ffd700 50%, #ff3b3b 80%, transparent)',
            opacity: spinning ? 0.3 : 0.5,
            boxShadow: '0 0 12px #ff3b3b',
          }}
        />

        <div className="flex justify-center gap-2 sm:gap-3">
          {grid.map((reel, i) => (
            <Reel
              key={i}
              spinning={spinning}
              finalSymbols={reel}
              delay={REEL_DELAYS[i]}
              highlightRows={highlightByReel[i]}
            />
          ))}
        </div>

        {/* ✨ NEUE Gewinn-Anzeige (multi-payline kompatibel) */}
        <AnimatePresence>
          {winInfo && !spinning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="pointer-events-none absolute inset-x-0 -top-4 z-30 mx-auto w-fit"
            >
              <div
                className="rounded-full px-5 py-1.5 text-center"
                style={{
                  background: 'linear-gradient(90deg, #ff5a1f, #ffd700, #ff5a1f)',
                  boxShadow: '0 0 24px #ff8a1f',
                }}
              >
                <div className="text-[10px] font-bold tracking-widest text-black/70">
                  {winInfo.lineCount > 1
                    ? `${winInfo.lineCount} PAYLINES`
                    : (winInfo.winningLines?.[0]?.paylineName || 'GEWINN')}
                  {winInfo.multiplier > 1 && ` · ×${winInfo.multiplier}`}
                </div>
                <div className="text-lg font-black text-black">
                  +{lastWin.toLocaleString('de-DE')} ₵
                </div>
                {winInfo.hasWildWin && (
                  <div className="text-[10px] font-black tracking-widest text-red-900">
                    +{FREE_SPINS_AWARD} FREISPIELE!
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ... Einsatz + Spin + Buttons bleiben unverändert ... */}

      {/* Gewinntabelle-Panel – Text aktualisieren */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 w-full overflow-hidden"
          >
            <div className="rounded-2xl border border-amber-500/20 bg-black/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-widest text-amber-200">GEWINNTABELLE</h3>
                <button onClick={() => setShowPaytable(false)} className="text-amber-300/60 hover:text-amber-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Paytable bet={bet} />
              <p className="mt-3 text-[11px] leading-relaxed text-amber-200/50">
                3 gleiche Symbole auf einer der 5 Paylines gewinnen (3 gerade + 2 Diagonalen).
                Der 🃏 Joker ist WILD und ersetzt jedes Symbol.
                3× Joker auf einer Linie = Jackpot + Freispiele.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat-Komponente bleibt unverändert
function Stat({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-amber-500/15 bg-black/40 px-2 py-2">
      <div className="flex items-center gap-1 text-amber-300/60">
        {icon}
        <span className="text-[9px] font-semibold tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-black text-amber-200">{value}</div>
    </div>
  );
}
