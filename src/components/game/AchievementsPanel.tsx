import { gameStore, useGameStore } from "@/game/state/gameStore";
import { ACHIEVEMENT_DEFS, levelForXp } from "@/game/content/achievements";

/** Glass side panel listing the achievement ledger; hidden ones show as ???. */
export function AchievementsPanel() {
  const open = useGameStore((s) => s.achievementsOpen);
  const unlocked = useGameStore((s) => s.achievementsUnlocked);
  const xp = useGameStore((s) => s.xp);
  const info = levelForXp(xp);
  const done = ACHIEVEMENT_DEFS.filter((d) => unlocked.includes(d.id)).length;

  return (
    <div
      className="panel-slide pointer-events-none fixed right-0 top-0 z-40 flex h-[100dvh] w-[min(420px,92vw)] items-center pr-4 sm:pr-6"
      data-open={open}
      aria-hidden={!open}
    >
      <div className="glass thin-scroll pointer-events-auto max-h-[82dvh] w-full overflow-y-auto rounded-[26px] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
            Career Log · {done}/{ACHIEVEMENT_DEFS.length}
          </p>
          <button
            onClick={() => gameStore.toggleAchievements()}
            className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close achievements"
          >
            ✕
          </button>
        </div>

        <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight">
          Level {info.level} — {info.title}
        </h2>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
            style={{ width: `${Math.round(info.progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 font-mono text-[10px] tracking-wider text-white/50">
          {xp} XP{info.next !== null ? ` · next level at ${info.next}` : " · max level"}
        </p>

        <ul className="mt-5 space-y-2.5">
          {ACHIEVEMENT_DEFS.map((d) => {
            const got = unlocked.includes(d.id);
            const masked = d.hidden && !got;
            return (
              <li
                key={d.id}
                className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 ${
                  got ? "bg-white/10" : "bg-white/[0.04] opacity-60"
                }`}
              >
                <span className="mt-0.5 text-lg" aria-hidden>
                  {masked ? "❔" : d.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    {masked ? "???" : d.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-white/65">
                    {masked ? "Keep exploring to reveal this one." : d.detail}
                  </p>
                </div>
                {got && <span className="ml-auto mt-1 text-emerald-300">✓</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
