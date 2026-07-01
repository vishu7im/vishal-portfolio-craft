import { useGameStore } from "@/game/state/gameStore";

export function ObjectiveTracker() {
  const objective = useGameStore((s) => s.objective);
  if (!objective) return null;

  return (
    <div className="glass pointer-events-none absolute left-4 top-24 max-w-[260px] rounded-2xl px-4 py-3 text-white">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-amber-300/80">Objective</p>
      <p className="mt-0.5 text-sm font-medium leading-snug">{objective.replace(/^Mission:\s*/, "")}</p>
    </div>
  );
}
