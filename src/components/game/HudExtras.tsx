import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import { frame } from "@/game/state/gameStore";
import { WORLD } from "@/game/world";
import { AREA_INTRO } from "@/game/content/narrative";

/** Full-screen veil shown until the world scene has committed its first frame. */
export function LoadingVeil() {
  const ready = useGameStore((s) => s.ready);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setHidden(true), 500);
      return () => clearTimeout(t);
    }
  }, [ready]);
  if (hidden) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 grid place-items-center transition-opacity duration-500"
      style={{
        opacity: ready ? 0 : 1,
        background: "radial-gradient(120% 90% at 50% 40%, #f6efe2 0%, #ece2d1 60%, #e3d7c2 100%)",
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#5b5346]">
        warming up the engine…
      </p>
    </div>
  );
}

/** Cozy title card whenever you cross into a new area. */
export function AreaIntro() {
  const areaId = useGameStore((s) => s.currentArea);
  const ready = useGameStore((s) => s.ready);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (!ready) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), first.current ? 3200 : 2400);
    first.current = false;
    return () => clearTimeout(t);
  }, [areaId, ready]);

  const intro = AREA_INTRO[areaId];
  const area = WORLD.areas.find((a) => a.id === areaId);
  if (!intro && !area) return null;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 text-center transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: `translate(-50%, ${visible ? 0 : -10}px)` }}
    >
      <p className="text-2xl font-semibold tracking-tight text-[#20242c] drop-shadow-sm">
        {intro?.title ?? area?.name}
      </p>
      {intro?.line && <p className="mt-1 text-sm text-[#5b5346]">{intro.line}</p>}
    </div>
  );
}

/** Speedometer + nitro flash, driven by the frame channel (no React re-render). */
export function Speedometer() {
  const barRef = useRef<HTMLDivElement>(null);
  const nitroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (barRef.current) barRef.current.style.width = `${Math.round(frame.speed * 100)}%`;
      if (nitroRef.current) nitroRef.current.style.opacity = frame.nitro ? "1" : "0";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="glass pointer-events-none absolute bottom-4 left-4 w-44 rounded-2xl px-4 py-3 text-white">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">Speed</span>
        <span ref={nitroRef} className="text-[10px] font-bold text-amber-300 transition-opacity" style={{ opacity: 0 }}>
          NITRO
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
        <div ref={barRef} className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400" style={{ width: "0%" }} />
      </div>
    </div>
  );
}

/** One-time controls legend that fades away after the first drive. */
export function ControlsCard() {
  const [gone, setGone] = useState(false);
  const ready = useGameStore((s) => s.ready);
  useEffect(() => {
    if (!ready) return;
    const onKey = () => setTimeout(() => setGone(true), 4000);
    window.addEventListener("keydown", onKey, { once: true });
    const t = setTimeout(() => setGone(true), 9000);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [ready]);

  return (
    <div
      className="glass pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-2xl px-5 py-3 text-white transition-all duration-500"
      style={{ opacity: gone ? 0 : 1, transform: `translate(-50%, ${gone ? 12 : 0}px)` }}
    >
      <div className="flex items-center gap-4 text-xs">
        <Legend keys="W A S D" label="Drive" />
        <Legend keys="Space" label="Drift" />
        <Legend keys="Shift" label="Nitro" />
        <Legend keys="E" label="Interact" />
      </div>
    </div>
  );
}

function Legend({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <kbd className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-black">{keys}</kbd>
      <span className="text-white/70">{label}</span>
    </div>
  );
}
