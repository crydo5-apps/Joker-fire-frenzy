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

// Position der Zellen im SVG (Prozent, 3x3 Grid)
// x: Mitte der 3 Walzen, y: Mitte der 3 Zeilen
const CELL_POS = {
  // [reel][row] -> { x, y } in %
  0: { 0: { x: 16.5, y: 18 }, 1: { x: 16.5, y: 50 }, 2: { x: 16.5, y: 82 } },
  1: { 0: { x: 50,   y: 18 }, 1: { x: 50,   y: 50 }, 2: { x: 50,   y: 82 } },
  2: { 0: { x: 83.5, y: 18 }, 1: { x: 83.5, y: 50 }, 2: { x: 83.5, y: 82 } },
};

export default function SlotMachine() {
  const {
    balance, bet, changeBet, grid, spinning, lastWin, winInfo, stats, spin, resetBalance,
    freeSpins, buyFreeSpins,
  } = useSlotGame();
  const [showPaytable, setShowPaytable] = useState(false);
  const inFreeSpins = freeSpins > 0;

  const canSpin = !spinning && (inFreeSpins || balance >= bet);
  const buyCost = bet * BUY_FEATURE_MULTIPLIER;
  const canBuy = !spinning && !inFreeSpins && balance >= buyCost;

  // Welche Zeilen pro Walze highlighten
  const highlightByReel = useMemo(() => {
    const map = [[], [], []];
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

  // Gewonnene Paylines für leuchtende Linien
  const winningPaylineIds = useMemo(() => {
    if (!winInfo?.winningLines?.length) return new Set();
    return new Set(winInfo.winningLines.map((l) => l.paylineId));
  }, [winInfo]);

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-8">
      {/* Titel */}
      <div className="mb-6 text-center">
        <h1
          className="text-4xl font-black tracking-tight sm:text-6xl"
          style={{
            background: 'linear-gradient(180deg, #fff4d1 0%, #ffb347 45%, #ff5a1f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 12px rgba(255,80,20,0.5))',
          }}
        >
          JOKER FIRE FRENZY
        </h1>
        <p className="mt-1 text-xs font-medium tracking-[0.3em] text-amber-300/70">
          DREHE · FINDE · GEWINNE
        </p>
      </div>

      {/* Freispiele-Banner */}
      <AnimatePresence>
        {inFreeSpins && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            className="mb-4 w-full"
          >
            <div
              className="flex items-center justify-center gap-3 rounded-2xl px-5 py-2"
              style={{
                background: 'linear-gradient(90deg, #7c1d1d 0%, #ff5a1f 50%, #7c1d1d 100%)',
                boxShadow: '0 0 24px #ff5a1f88, inset 0 0 12px rgba(0,0,0,0.4)',
              }}
            >
              <Flame className="h-5 w-5 text-amber-100" />
              <div className="text-center">
                <div className="text-[10px] font-bold tracking-[0.3em] text-amber-100/80">
                  FREISPIELE
                </div>
                <div className="text-lg font-black text-white">
                  {freeSpins} verbleibend · ×{FREE_SPINS_MULTIPLIER} MULTIPLIKATOR
                </div>
              </div>
              <Flame className="h-5 w-5 text-amber-100" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat-Leiste */}
      <div className="mb-4 grid w-full grid-cols-3 gap-2">
        <Stat icon={<Coins className="h-4 w-4" />} label="GUTHABEN" value={`${balance.toLocaleString('de-DE')} ₵`} />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="SPINS" value={stats.spins} />
        <Stat icon={<Trophy className="h-4 w-4" />} label="TOP-GEWINN" value={`${stats.biggest.toLocaleString('de-DE')} ₵`} />
      </div>

      {/* Walzenfenster */}
      <div
        className="relative w-full rounded-3xl p-3 sm:p-5"
        style={{
          background: 'linear-gradient(180deg, #3a1408 0%, #1a0703 100%)',
          boxShadow:
            '0 0 0 3px #b8860b, 0 0 0 6px #5c3a0e, 0 24px 60px rgba(255,80,20,0.25), inset 0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* ✨ Leuchtende Gewinnlinien (SVG Overlay) */}
        {!spinning && winningPaylineIds.size > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 z-20 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {PAYLINES.filter((p) => winningPaylineIds.has(p.id)).map((payline) => {
              const points = payline.cells
                .map(([reel, row]) => {
                  const pos = CELL_POS[reel][row];
                  return `\( {pos.x}, \){pos.y}`;
                })
                .join(' ');
              return (
                <g key={payline.id}>
                  {/* Glow */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.35"
                    style={{ filter: 'blur(3px)' }}
                  />
                  {/* Hauptlinie */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke="url(#winGradient)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animate
                      attributeName="opacity"
                      values="0.7;1;0.7"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </polyline>
                </g>
              );
            })}
            <defs>
              <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff3b3b" />
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#ff3b3b" />
              </linearGradient>
            </defs>
          </svg>
        )}

        <div className="relative z-10 flex justify-center gap-2 sm:gap-3">
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

        {/* Gewinn-Anzeige */}
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

      {/* Einsatz + Spin */}
      <div className="mt-6 flex w-full flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-widest text-amber-300/70">EINSATZ</span>
          {BET_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => changeBet(b)}
              disabled={spinning}
              className={`h-9 min-w-[2.5rem] rounded-lg px-2 text-sm font-bold transition-all disabled:opacity-40 ${
                bet === b
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-[0_0_14px_#ffb347]'
                  : 'bg-black/40 text-amber-200/70 hover:bg-black/60'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <button
          onClick={spin}
          disabled={!canSpin}
          className="group relative h-20 w-20 rounded-full disabled:cursor-not-allowed"
          style={{
            background: canSpin
              ? 'radial-gradient(circle at 50% 35%, #ffe98a 0%, #ff7a1a 55%, #c1272d 100%)'
              : 'radial-gradient(circle at 50% 35%, #555 0%, #222 100%)',
            boxShadow: canSpin
              ? '0 0 30px #ff6a1a, 0 8px 20px rgba(0,0,0,0.5), inset 0 -4px 8px rgba(0,0,0,0.4)'
              : 'inset 0 0 12px rgba(0,0,0,0.6)',
          }}
        >
          <motion.span
            className="flex flex-col items-center justify-center text-black"
            animate={spinning ? { rotate: 360 } : {}}
            transition={spinning ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
          >
            <Flame className="h-7 w-7" />
            <span className="text-[10px] font-black tracking-widest">
              {spinning ? 'SPIN' : 'DREHEN'}
            </span>
          </motion.span>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={buyFreeSpins}
            disabled={!canBuy}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canBuy
                ? 'linear-gradient(90deg, #7c1d1d, #ff5a1f, #7c1d1d)'
                : 'rgba(0,0,0,0.4)',
              boxShadow: canBuy ? '0 0 16px #ff5a1f88' : 'none',
            }}
          >
            <Zap className="h-3.5 w-3.5 text-amber-100" />
            <span className="text-amber-100">Freispiele kaufen · {buyCost.toLocaleString('de-DE')} ₵</span>
          </button>
          <button
            onClick={() => setShowPaytable((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-black/40 px-3 py-1.5 text-amber-200/80 hover:bg-black/60"
          >
            <Info className="h-3.5 w-3.5" /> Gewinntabelle
          </button>
          {balance < bet && (
            <button
              onClick={resetBalance}
              className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-red-200 hover:bg-red-900/40"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Guthaben zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Gewinntabelle */}
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
