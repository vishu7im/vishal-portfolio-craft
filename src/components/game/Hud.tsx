import { Link } from "react-router-dom";
import { gameStore, useGameStore } from "@/game/state/gameStore";
import { WORLD } from "@/game/world";
import { levelForXp } from "@/game/content/achievements";

export function Hud() {
  const areaId = useGameStore((s) => s.currentArea);
  const xp = useGameStore((s) => s.xp);
  const muted = useGameStore((s) => s.muted);
  const area = WORLD.areas.find((a) => a.id === areaId);
  const info = levelForXp(xp);

  return (
    <>
      {/* top-left: current area */}
      <div className="glass pointer-events-none absolute left-4 top-4 rounded-2xl px-4 py-3 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">
          {area?.careerTheme ?? "Explore"}
        </p>
        <p className="text-lg font-semibold leading-tight">{area?.name ?? "—"}</p>
      </div>

      {/* top-right: XP/level + controls */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          onClick={() => gameStore.toggleAchievements()}
          className="glass pointer-events-auto flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-white transition hover:bg-white/10"
          aria-label="Open career log"
          title={`Level ${info.level} — ${info.title}`}
        >
          <span className="text-base">🏆</span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[13px] font-semibold">Lv {info.level}</span>
            <span className="mt-1 block h-1 w-14 overflow-hidden rounded-full bg-white/20">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
                style={{ width: `${Math.round(info.progress * 100)}%` }}
              />
            </span>
          </span>
          <span className="tabular-nums text-xs font-medium text-white/70">{xp} XP</span>
        </button>
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
