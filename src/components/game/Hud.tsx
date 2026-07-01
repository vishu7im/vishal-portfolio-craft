import { Link } from "react-router-dom";
import { gameStore, useGameStore } from "@/game/state/gameStore";
import { WORLD } from "@/game/world";

export function Hud() {
  const areaId = useGameStore((s) => s.currentArea);
  const coins = useGameStore((s) => s.coins);
  const muted = useGameStore((s) => s.muted);
  const area = WORLD.areas.find((a) => a.id === areaId);

  return (
    <>
      {/* top-left: current area */}
      <div className="glass pointer-events-none absolute left-4 top-4 rounded-2xl px-4 py-3 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
          {area?.careerTheme ?? "Explore"}
        </p>
        <p className="text-lg font-semibold leading-tight">{area?.name ?? "—"}</p>
      </div>

      {/* top-right: coins + controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <div className="glass pointer-events-none flex items-center gap-2 rounded-full px-4 py-2 text-white">
          <span className="text-base">🪙</span>
          <span className="tabular-nums text-sm font-semibold">{coins}</span>
        </div>
        <button
          onClick={() => gameStore.toggleGarage()}
          className="glass pointer-events-auto grid h-10 place-items-center rounded-full px-4 text-xs font-medium text-white/80 transition hover:text-white"
          aria-label="Open garage"
        >
          🚗 Garage
        </button>
        <button
          onClick={() => gameStore.toggleMute()}
          className="glass pointer-events-auto grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:text-white"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <Link
          to="/classic"
          className="glass pointer-events-auto grid h-10 place-items-center rounded-full px-4 text-xs font-medium text-white/80 transition hover:text-white"
        >
          Résumé view
        </Link>
      </div>
    </>
  );
}
