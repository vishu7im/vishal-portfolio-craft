import { useGameStore } from "@/game/state/gameStore";

export function InteractHint() {
  const nearLabel = useGameStore((s) => s.nearLabel);
  const focusedId = useGameStore((s) => s.focusedId);
  const show = !!nearLabel && !focusedId;

  return (
    <div
      className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 transition-all duration-200"
      style={{ opacity: show ? 1 : 0, transform: `translate(-50%, ${show ? 0 : 8}px)` }}
    >
      <div className="glass flex items-center gap-3 rounded-full px-5 py-2.5 text-white">
        <kbd className="grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-sm font-bold text-black">
          E
        </kbd>
        <span className="text-sm font-medium">{nearLabel}</span>
      </div>
    </div>
  );
}
