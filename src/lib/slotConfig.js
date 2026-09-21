// Joker Fire Frenzy — Symboldefinitionen, Gewinntabelle und Spiellogik
// ✨ MIT 5 KLASSISCHEN PAYLINES (gerade + Diagonalen)

const IMG = 'https://media.base44.com/images/public/6a95e6def874ab66190e3067';

// Bild während dem Walzen-Drehen (für ALLE Zellen)
export const SPIN_BLUR_IMAGE = `${IMG}/4a12649ae_file_1789810352705.png`;
export const SYMBOLS = [
  { id: 'joker',  label: 'JOKER',  icon: '🃏', color: '#ff2d2d', glow: '#ff5a3c', weight: 1,  payout: 100, wild: true,
    image: `${IMG}/bf8c463c9_grok_image_1789987816160.jpg` },
  { id: 'blue_diamond', label: 'BLUE DIAMOND', icon: '💎', color: '#1e6fff', glow: '#55aeea', weight: 2,  payout: 40,
    image: `${IMG}/1021848f5_diamond.png` },
  { id: 'crown',  label: 'CROWN',  icon: '👑', color: '#ffd700', glow: '#ffe98a', weight: 3,  payout: 25,
    image: `${IMG}/0bff3d399_generated_image.png` },
  { id: 'diamond',label: 'DIAMOND',icon: '💎', color: '#34e2ff', glow: '#a9f5ff', weight: 4,  payout: 15,
    image: `${IMG}/1021848f5_diamond.png` },
  { id: 'bar',    label: 'BAR',    icon: 'BAR', color: '#b8860b', glow: '#ffd700', weight: 4,  payout: 12,
    image: `${IMG}/d72105319_b024db91-de3f-4a83-92ca-11d8bbae0598.jpg` },
  { id: 'bell',   label: 'BELL',   icon: '🔔', color: '#ffcc33', glow: '#ffe08a', weight: 5,  payout: 8,
    image: `${IMG}/d6a07d793_b2fae515-3769-4fda-81d7-d1ebc2c3dede.jpg` },
  { id: 'cherry', label: 'CHERRY', icon: '🍒', color: '#ff2d55', glow: '#ff7a93', weight: 6,  payout: 5,
    image: `${IMG}/993c09ab3_b445ff34-0c2a-4611-8f0b-6702adff99ac.jpg` },
  { id: 'lemon',  label: 'LEMON',  icon: '🍋', color: '#fde047', glow: '#fef08a', weight: 7,  payout: 3,
    image: `${IMG}/0449bddb7_c1bcb755-c092-4b00-9c09-53c49ee97505.jpg` },
  { id: 'clover', label: 'CLOVER', icon: '🍀', color: '#ffd700', glow: '#fffacd', weight: 8,  payout: 2,
    image: `${IMG}/20d6becc4_gold-clover.png` },
];

export const BET_OPTIONS = [1, 5, 10, 25, 50, 100];
export const FREE_SPINS_AWARD = 8;
export const FREE_SPINS_MULTIPLIER = 2;
export const BUY_FEATURE_MULTIPLIER = 50; // Kaufpreis = Einsatz × 50
export const START_BALANCE = 1000;
export const REEL_COUNT = 3;
export const ROW_COUNT = 3;
export const SPIN_DURATION = 1600; // ms bis alle Walzen stehen
export const REEL_DELAYS = [800, 1150, 1500]; // Stopp-Zeiten pro Walzel
export const SPIN_DURATION_TURBO = 650;
export const REEL_DELAYS_TURBO = [300, 450, 600];


// 🎰 DIE 5 PAYLINES
export const PAYLINES = [
  {
    id: 1,
    name: '🔝 TOP LINE',
    icon: '—',
    cells: [[0, 0], [1, 0], [2, 0]] // Obere Reihe gerade
  },
  {
    id: 2,
    name: '⏸️ CENTER LINE',
    icon: '—',
    cells: [[0, 1], [1, 1], [2, 1]] // Mittlere Reihe gerade
  },
  {
    id: 3,
    name: '🔽 BOTTOM LINE',
    icon: '—',
    cells: [[0, 2], [1, 2], [2, 2]] // Untere Reihe gerade
  },
  {
    id: 4,
    name: '↘️ DIAGONAL DOWN',
    icon: '\\',
    cells: [[0, 0], [1, 1], [2, 2]] // Von oben-links nach unten-rechts
  },
  {
    id: 5,
    name: '↗️ DIAGONAL UP',
    icon: '/',
    cells: [[0, 2], [1, 1], [2, 0]] // Von unten-links nach oben-rechts
  }
];

const TOTAL_WEIGHT = SYMBOLS.reduce((s, x) => s + x.weight, 0);

// Gewichtete Ziehung eines Symbols
export function weightedPick() {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const sym of SYMBOLS) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

// Zieht ein vollständiges 3x3-Walzenraster (reel -> row)
export function makeGrid() {
  const grid = [];
  for (let r = 0; r < REEL_COUNT; r++) {
    const reel = [];
    for (let row = 0; row < ROW_COUNT; row++) reel.push(weightedPick());
    grid.push(reel);
  }
  return grid;
}

export function emptyGrid() {
  return Array.from({ length: REEL_COUNT }, () =>
    Array.from({ length: ROW_COUNT }, () => SYMBOLS[SYMBOLS.length - 1])
  );
}

// Einzelne Payline auswerten (mit Joker als Wild)
export function evaluateLine(line) {
  const nonWild = line.filter((s) => !s.wild);
  if (nonWild.length === 0) {
    return { win: true, symbol: SYMBOLS.find((s) => s.wild), count: 3, name: 'JOKER JACKPOT' };
  }
  const first = nonWild[0];
  const allSame = nonWild.every((s) => s.id === first.id);
  if (allSame) return { win: true, symbol: first, count: 3, name: first.label };
  return { win: false };
}

// ✨ NEUE FUNKTION: Alle 5 PAYLINES auswerten (3 gerade + 2 Diagonalen)
export function evaluateAllPaylines(grid) {
  const winningLines = [];
  let totalWin = 0;
  let hasWildWin = false;

  for (const payline of PAYLINES) {
    // Symbole der aktuellen Payline extrahieren
    const symbols = payline.cells.map(([reel, row]) => grid[reel][row]);
    
    // Diese Payline auswerten
    const result = evaluateLine(symbols);
    
    if (result.win) {
      winningLines.push({
        paylineId: payline.id,
        paylineName: payline.name,
        paylineIcon: payline.icon,
        ...result
      });
      totalWin += result.symbol.payout;
      if (result.symbol.wild) hasWildWin = true;
    }
  }

  return {
    winningLines,
    totalMultiplier: totalWin,
    hasWildWin,
    win: winningLines.length > 0,
    totalPaylines: PAYLINES.length
  };
}
