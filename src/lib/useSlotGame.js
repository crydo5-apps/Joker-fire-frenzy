import { useCallback, useEffect, useState } from 'react';
import {
  BET_OPTIONS, START_BALANCE, SPIN_DURATION, makeGrid, emptyGrid, evaluateLine, evaluateAllLines,
  FREE_SPINS_AWARD, FREE_SPINS_MULTIPLIER, BUY_FEATURE_MULTIPLIER,
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
  const [grid, setGrid] = useState(emptyGrid);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [winInfo, setWinInfo] = useState(null);
  const [stats, setStats] = useState(loadStats);
  const [freeSpins, setFreeSpins] = useState(0);
  const [freeSpinsAwarded, setFreeSpinsAwarded] = useState(0); // für Banner-Animation

  const persist = (b) => localStorage.setItem(STORAGE_KEY, String(b));

  const spin = useCallback(() => {
    const inFreeSpins = freeSpins > 0;
    if (spinning) return;
    if (!inFreeSpins && balance < bet) return;

    if (inFreeSpins) {
      setFreeSpins((f) => f - 1);
    } else {
      setBalance((b) => { const nb = b - bet; persist(nb); return nb; });
    }
    setLastWin(0);
    setWinInfo(null);

    const newGrid = makeGrid();
    setGrid(newGrid);
    setSpinning(true);
    setStats((s) => ({ ...s, spins: s.spins + 1 }));

    setTimeout(() => {
      setSpinning(false);
      
      // ✨ ALLE 3 LINIEN PRÜFEN STATT NUR EINER
      const allLinesResult = evaluateAllLines(newGrid);
      
      if (allLinesResult.win) {
        const mult = inFreeSpins ? FREE_SPINS_MULTIPLIER : 1;
        // Gewinne von ALLEN gewonnenen Linien addieren
        const amount = bet * allLinesResult.totalMultiplier * mult;
        
        setLastWin(amount);
        setWinInfo({ 
          ...allLinesResult, 
          amount, 
          freeSpin: inFreeSpins, 
          multiplier: mult,
          lineCount: allLinesResult.winningLines.length // Wie viele Linien gewonnen haben
        });
        
        setBalance((b) => { const nb = b + amount; persist(nb); return nb; });
        setStats((s) => ({
          spins: s.spins + 1,
          totalWon: s.totalWon + amount,
          biggest: Math.max(s.biggest, amount),
        }));
        
        // Wenn EINE BELIEBIGE Linie 3 Joker hat, lösen Freispiele aus (auch Retrigger)
        if (allLinesResult.hasWildWin) {
          setFreeSpins((f) => f + FREE_SPINS_AWARD);
          setFreeSpinsAwarded(FREE_SPINS_AWARD);
        }
      }
    }, SPIN_DURATION);
  }, [spinning, balance, bet, freeSpins]);

  // Freispiele automatisch abspielen
  useEffect(() => {
    if (freeSpins > 0 && !spinning) {
      const t = setTimeout(() => spin(), 900);
      return () => clearTimeout(t);
    }
  }, [freeSpins, spinning, spin]);

  const changeBet = useCallback((value) => {
    if (!spinning && freeSpins === 0) setBet(value);
  }, [spinning, freeSpins]);

  // Freispiele direkt kaufen (Buy Feature)
  const buyFreeSpins = useCallback(() => {
    if (spinning || freeSpins > 0) return;
    const cost = bet * BUY_FEATURE_MULTIPLIER;
    if (balance < cost) return;
    setBalance((b) => { const nb = b - cost; persist(nb); return nb; });
    setFreeSpins(FREE_SPINS_AWARD);
    setFreeSpinsAwarded(FREE_SPINS_AWARD);
  }, [spinning, freeSpins, bet, balance]);

  const resetBalance = useCallback(() => {
    setBalance(START_BALANCE);
    persist(START_BALANCE);
    setLastWin(0);
    setWinInfo(null);
    setFreeSpins(0);
  }, []);

  return {
    balance, bet, changeBet, grid, spinning, lastWin, winInfo, stats, spin, resetBalance,
    freeSpins, freeSpinsAwarded, buyFreeSpins,
  };
}
