import Embers from '@/components/slot/Embers';
import SlotMachine from '@/components/slot/SlotMachine';

export default function Home() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, #5a1a08 0%, #2a0a04 40%, #0a0301 100%)',
      }}
    >
      <Embers />
      <SlotMachine />
    </div>
  );
}