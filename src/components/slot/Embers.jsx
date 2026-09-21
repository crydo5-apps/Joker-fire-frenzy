import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Aufsteigende Funkenpartikel im Hintergrund
export default function Embers({ count = 24 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 6,
        duration: 5 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e) => (
        <motion.span
          key={e.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background:
              'radial-gradient(circle, #ffd27a 0%, #ff7a1a 50%, rgba(255,60,0,0) 70%)',
            boxShadow: '0 0 8px 2px rgba(255,120,30,0.6)',
          }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ y: '-110vh', x: e.drift, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: e.duration,
            delay: e.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}