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
