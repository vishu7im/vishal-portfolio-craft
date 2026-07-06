import { frame, useGameStore } from "@/game/state/gameStore";

/** Incoming "client calling" offer — top-centre card with Accept / Decline. */
export function PhoneCallCard() {
  const call = useGameStore((s) => s.phoneCall);
  if (!call) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2">
      <div className="glass pointer-events-auto w-[min(360px,90vw)] rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <span className="animate-bounce text-2xl" aria-hidden>
            📞
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/55">
              Incoming call
            </p>
            <p className="text-base font-semibold leading-tight">{call.caller}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-snug text-white/80">{call.pitch}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-300">
          ⏱ {Math.round(call.timeLimitMs / 1000)}s job · +{call.rewardXp} XP
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              frame.phoneAnswer = "accept";
            }}
            className="flex-1 rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300"
          >
            Accept
          </button>
          <button
            onClick={() => {
              frame.phoneAnswer = "decline";
            }}
            className="flex-1 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/25"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
