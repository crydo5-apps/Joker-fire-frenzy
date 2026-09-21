import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { SPIN_BLUR_IMAGE } from '@/lib/slotConfig';

export default function SymbolCell({ symbol, highlight, useIcon }) {
  // Während dem Drehen: immer das Spin-Symbol
  const showSpinImage = useIcon && SPIN_BLUR_IMAGE;
  const showSymbolImage = !useIcon && symbol.image;

  return (
    <div
      className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl sm:h-28 sm:w-28"
      style={{
        background: showSpinImage || showSymbolImage
          ? 'transparent'
          : 'linear-gradient(180deg, rgba(20,8,4,0.9) 0%, rgba(40,16,8,0.9) 100%)',
        boxShadow: highlight
          ? `0 0 0 2px ${symbol.glow}, 0 0 22px 4px ${symbol.glow}aa`
          : 'inset 0 0 14px rgba(0,0,0,0.6)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {showSpinImage ? (
        <Image
          src={SPIN_BLUR_IMAGE}
          alt="spin"
          fittingType="fit"
          className="h-full w-full"
        />
      ) : showSymbolImage ? (
        <Image
          src={symbol.image}
          alt={symbol.label}
          fittingType="fit"
          className="h-full w-full"
        />
      ) : (
        <motion.span
          className="text-5xl sm:text-6xl"
          style={{ filter: `drop-shadow(0 0 10px ${symbol.glow})` }}
          animate={highlight ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, repeat: highlight ? Infinity : 0 }}
        >
          {symbol.icon}
        </motion.span>
      )}
    </div>
  );
}
