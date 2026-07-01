import { gameStore, useGameStore } from "@/game/state/gameStore";
import { VEHICLES, UNLOCKS } from "@/game/config/tuning";

const ORDER = ["sports", "electric", "vintage", "cyber", "f1", "hover"];

function unlockHint(key: string): string {
  return UNLOCKS.find((u) => u.vehicle === key)?.hint ?? "";
}

export function GarageMenu() {
  const open = useGameStore((s) => s.garageOpen);
  const unlocked = useGameStore((s) => s.vehiclesUnlocked);
  const selected = useGameStore((s) => s.selectedVehicle);

  if (!open) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={() => gameStore.setGarage(false)}
        aria-hidden
      />
      <div className="glass relative max-h-[86dvh] w-[min(720px,94vw)] overflow-y-auto thin-scroll rounded-[26px] p-7 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">The Garage</p>
            <h2 className="mt-1 text-2xl font-semibold">Pick your ride</h2>
          </div>
          <button
            onClick={() => gameStore.setGarage(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ORDER.map((key) => {
            const v = VEHICLES[key];
            const isUnlocked = unlocked.includes(key);
            const isSelected = selected === key;
            return (
              <button
                key={key}
                disabled={!isUnlocked}
                onClick={() => {
                  gameStore.selectVehicle(key);
                  gameStore.setGarage(false);
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-amber-300/70 bg-white/10"
                    : isUnlocked
                    ? "border-white/12 hover:bg-white/8"
                    : "border-white/8 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold">{v.name}</span>
                  {isSelected ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">Driving</span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] uppercase tracking-wide text-white/50">Tap to drive</span>
                  ) : (
                    <span className="text-base">🔒</span>
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-snug text-white/70">{v.blurb}</p>
                <div className="mt-3 flex gap-1.5">
                  <Stat label="Speed" value={v.maxSpeed / 15} />
                  <Stat label="Grip" value={v.gripNormal / 0.22} />
                  <Stat label="Turn" value={v.turnRate / 0.075} />
                </div>
                {!isUnlocked && (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-200/70">
                    🔒 {unlockHint(key)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{label}</p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-white/70" style={{ width: `${Math.min(100, Math.max(8, value * 100))}%` }} />
      </div>
    </div>
  );
}
