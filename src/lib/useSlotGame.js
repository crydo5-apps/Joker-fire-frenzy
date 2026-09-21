 import { useCallback, useEffect, useRef, useState } from 'react';
import {
  START_BALANCE,
  SPIN_DURATION,
  SPIN_DURATION_TURBO,
  makeGrid,
  emptyGrid,
  evaluateAllPaylines,
  FREE_SPINS_AWARD,
  FREE_SPINS_MULTIPLIER,
  BUY_FEATURE_MULTIPLIER,
} from './slotConfig';

const STORAGE_KEY = 'jff_balance_v1';
const STATS_KEY = 'jff_stats_v1';

function loadBalance() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : START_BALANCE;
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { spins: 0, totalWon: 0, biggest: 0 };
  } catch {
    return { spins: 0, totalWon: 0, biggest: 0 };
  }
}

export function useSlotGame() {
  const [balance, setBalance] = useState(loadBalance);
  const [bet, setBet] = useState(10);
  const [grid, setGrid] = useState(emptyGrid());
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winInfo, setWinInfo] = useState(null);
  const [stats, setStats] = useState(loadStats);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const turboRef = useRef(turbo);
  turboRef.current = turbo;

  const persist = (b) => localStorage.setItem(STORAGE_KEY, String(b));
  const persistStats = (s) => localStorage.setItem(STATS_KEY, JSON.stringify(s));

  const spin = useCallback(() => {
    const inFreeSpins = freeSpins > 0;
    if (spinning) return;
    if (!inFreeSpins && balance < bet) {
      setAutoPlay(false);
      return;
    }

    if (inFreeSpins) {
      setFreeSpins((f) => f - 1);
    } else {
      setBalance((b) => {
        const nb = b - bet;
        persist(nb);
        return nb;
      });
    }
    setLastWin(0);
    setWinInfo(null);

    const newGrid = makeGrid();
    setGrid(newGrid);
    setSpinning(true);
    setStats((s) => {
      const next = { ...s, spins: s.spins + 1 };
      persistStats(next);
      return next;
    });

    const duration = turboRef.current ? SPIN_DURATION_TURBO : SPIN_DURATION;

    setTimeout(() => {
      setSpinning(false);

      const allPaylineResults = evaluateAllPaylines(newGrid);

      if (allPaylineResults.win) {
        const mult = inFreeSpins ? FREE_SPINS_MULTIPLIER : 1;
        const amount = bet * allPaylineResults.totalMultiplier * mult;

        setLastWin(amount);
        setWinInfo({
          ...allPaylineResults,
          amount,
          freeSpin: inFreeSpins,
          multiplier: mult,
          lineCount: allPaylineResults.winningLines.length,
        });

        setBalance((b) => {
          const nb = b + amount;
          persist(nb);
          return nb;
        });

        setStats((s) => {
          const next = {
            ...s,
            totalWon: s.totalWon + amount,
            biggest: Math.max(s.biggest, amount),
          };
          persistStats(next);
          return next;
        });

        if (allPaylineResults.hasWildWin) {
          setFreeSpins((f) => f + FREE_SPINS_AWARD);
          setFreeSpinsAwarded(FREE_SPINS_AWARD);
        }
      }
    }, duration);
  }, [spinning, balance, bet, freeSpins]);

  // Freispiele automatisch
  useEffect(() => {
    if (freeSpins > 0 && !spinning) {
      const delay = turboRef.current ? 250 : 900;
      const t = setTimeout(() => spin(), delay);
      return () => clearTimeout(t);
    }
  }, [freeSpins, spinning, spin]);

  // Auto-Play
  useEffect(() => {
    if (!autoPlay || spinning || freeSpins > 0) return;
    if (balance < bet) {
      setAutoPlay(false);
      return;
    }
    const delay = turbo ? 200 : 600;
    const t = setTimeout(() => spin(), delay);
    return () => clearTimeout(t);
  }, [autoPlay, spinning, freeSpins, balance, bet, turbo, spin]);

  const changeBet = useCallback(
    (value) => {
      if (!spinning && freeSpins === 0 && !autoPlay) setBet(value);
    },
    [spinning, freeSpins, autoPlay]
  );

  const toggleTurbo = useCallback(() => setTurbo((v) => !v), []);
  const toggleAutoPlay = useCallback(() => setAutoPlay((v) => !v), []);

  const buyFreeSpins = useCallback(() => {
    if (spinning || freeSpins > 0 || autoPlay) return;
    const cost = bet * BUY_FEATURE_MULTIPLIER;
    if (balance < cost) return;
    setBalance((b) => {
      const nb = b - cost;
      persist(nb);
      return nb;
    });
    setFreeSpins(FREE_SPINS_AWARD);
    setFreeSpinsAwarded(FREE_SPINS_AWARD);
  }, [spinning, freeSpins, autoPlay, bet, balance]);

  const resetBalance = useCallback(() => {
    setBalance(START_BALANCE);
    persist(START_BALANCE);
    setLastWin(0);
    setWinInfo(null);
    setFreeSpins(0);
    setAutoPlay(false);
  }, []);

  return {
    balance,
    bet,
    changeBet,
    grid,
    spinning,
    lastWin,
    winInfo,
    stats,
    spin,
    resetBalance,
    freeSpins,
    freeSpinsAwarded,
    buyFreeSpins,
    turbo,
    toggleTurbo,
    autoPlay,
    toggleAutoPlay,
  };
}
