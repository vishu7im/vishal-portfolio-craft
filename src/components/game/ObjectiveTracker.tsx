import { useGameStore } from "@/game/state/gameStore";

export function ObjectiveTracker() {
  const title = useGameStore((s) => s.missionTitle);
  const brief = useGameStore((s) => s.missionBrief);
  const objective = useGameStore((s) => s.objective);
  if (!title && !objective) return null;

  // The live objective line duplicates the title at mission start — only show it
  // once it has advanced to a distinct sub-status (checkpoint/timer/etc.).
  const status = objective && objective !== title ? objective.replace(/^Mission:\s*/, "") : null;

  return (
    <div className="glass pointer-events-none absolute left-4 top-24 max-w-[280px] rounded-2xl px-4 py-3 text-white">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Mission</p>
      {title && <p className="mt-0.5 text-sm font-semibold leading-snug">{title}</p>}
      {brief && <p className="mt-1 text-xs leading-snug text-white/75">{brief}</p>}
      {status && <p className="mt-2 text-sm font-medium leading-snug text-amber-100">{status}</p>}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        Follow the route on the map ➤
      </p>
    </div>
  );
}
