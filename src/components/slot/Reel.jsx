import { useEffect, useRef, useState } from 'react';
import { SYMBOLS } from '@/lib/slotConfig';
import SymbolCell from './SymbolCell';

// Eine Walze: scrollt schnell durch und stoppt nach `delay` auf `finalSymbols`
// highlightRows = Set/Array der Zeilen-Indizes (0,1,2), die leuchten sollen
export default function Reel({ spinning, finalSymbols, delay, highlightRows = [] }) {
  const [display, setDisplay] = useState(finalSymbols);
  const cycleRef = useRef(null);
  const stopRef = useRef(null);

  const highlightSet = new Set(highlightRows);

  useEffect(() => {
    if (spinning) {
      cycleRef.current = setInterval(() => {
        setDisplay(
          Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );
      }, 55);
      stopRef.current = setTimeout(() => {
        clearInterval(cycleRef.current);
        setDisplay(finalSymbols);
      }, delay);
      return () => {
        clearInterval(cycleRef.current);
        clearTimeout(stopRef.current);
      };
    }
    setDisplay(finalSymbols);
  }, [spinning, finalSymbols, delay]);

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-2"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(30,10,4,0.55))',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7)',
      }}
    >
      {display.map((sym, row) => (
        <div
          key={row}
          className="transition-all"
          style={{
            filter: spinning ? 'blur(1.5px)' : 'none',
            opacity: spinning ? 0.85 : 1,
          }}
        >
          <SymbolCell
            symbol={sym}
            highlight={!spinning && highlightSet.has(row)}
            useIcon={spinning}
          />
        </div>
      ))}
    </div>
  );
}
