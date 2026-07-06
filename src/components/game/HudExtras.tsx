import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import { frame } from "@/game/state/gameStore";
import { WORLD, chapterFor } from "@/game/world";
import { LEVEL_TITLES } from "@/game/content/achievements";

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

/** Chapter title card whenever you cross into a new life chapter. */
export function AreaIntro() {
  const areaId = useGameStore((s) => s.currentArea);
  const ready = useGameStore((s) => s.ready);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (!ready) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), first.current ? 3600 : 2800);
    first.current = false;
    return () => clearTimeout(t);
  }, [areaId, ready]);

  const chapter = chapterFor(areaId);
  const area = WORLD.areas.find((a) => a.id === areaId);
  if (!chapter && !area) return null;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 text-center transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: `translate(-50%, ${visible ? 0 : -10}px)` }}
    >
      {chapter && (
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#8a7a5e]">
          Chapter {chapter.order} · {chapter.years}
        </p>
      )}
      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#20242c] drop-shadow-sm">
        {chapter?.title ?? area?.name}
      </p>
      {chapter?.line && <p className="mt-1 text-sm text-[#5b5346]">{chapter.line}</p>}
    </div>
  );
}

/** Big centre flash when the XP curve crosses a level threshold. */
export function LevelUp() {
  const levelUp = useGameStore((s) => s.lastLevelUp);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!levelUp) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [levelUp]);

  if (!levelUp) return null;
  const title = LEVEL_TITLES[levelUp.level - 1] ?? "";

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[30%] -translate-x-1/2 text-center transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate(-50%, ${visible ? 0 : 8}px) scale(${visible ? 1 : 0.94})`,
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-amber-500">
        Level up
      </p>
      <p className="mt-1 text-4xl font-bold tracking-tight text-[#20242c] drop-shadow-sm">
        Level {levelUp.level}
      </p>
      <p className="mt-1 text-base font-medium text-[#5b5346]">{title}</p>
    </div>
  );
}

/** Tiny day/night indicator driven by frame.timeOfDay (no React re-render). */
export function ClockChip() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) {
        const t = frame.timeOfDay; // 0 = noon, 0.45–0.62 = night
        const icon = t > 0.38 && t < 0.7 ? "🌙" : t > 0.28 && t < 0.8 ? "🌇" : "☀️";
        if (ref.current.textContent !== icon) ref.current.textContent = icon;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="glass pointer-events-none absolute bottom-4 left-44 grid h-10 w-10 place-items-center rounded-full">
      <span ref={ref} className="text-base" aria-label="time of day" />
    </div>
  );
}

// gauge geometry: 240° sweep centred on (50,55), needle parked at 150°
const GAUGE_R = 38;
const GAUGE_ARC = 2 * Math.PI * GAUGE_R * (240 / 360);

/** Circular racing-style speedometer, driven by the frame channel (no React re-render). */
export function Speedometer() {
  const arcRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGPathElement>(null);
  const driftRef = useRef<HTMLSpanElement>(null);
  const revRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const s = frame.speed;
      if (arcRef.current)
        arcRef.current.style.strokeDashoffset = `${GAUGE_ARC * (1 - s)}`;
      if (needleRef.current)
        needleRef.current.setAttribute("transform", `rotate(${150 + 240 * s}, 50, 55)`);
      if (numRef.current) {
        const v = `${Math.round(s * 180)}`;
        if (numRef.current.textContent !== v) numRef.current.textContent = v;
      }
      if (ringRef.current) ringRef.current.style.opacity = frame.nitro ? "1" : "0";
      if (driftRef.current) driftRef.current.style.opacity = frame.drifting ? "1" : "0";
      if (revRef.current) revRef.current.style.opacity = frame.reversing ? "1" : "0";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // arc endpoints for a 240° sweep (150° → 390°) around (50,55)
  const p = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${50 + GAUGE_R * Math.cos(a)} ${55 + GAUGE_R * Math.sin(a)}`;
  };
  const arcPath = `M ${p(150)} A ${GAUGE_R} ${GAUGE_R} 0 1 1 ${p(390)}`;

  return (
    <div className="glass pointer-events-none absolute bottom-4 left-4 h-36 w-36 rounded-full text-white">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {/* nitro halo */}
        <path
          ref={ringRef}
          d={arcPath}
          fill="none"
          stroke="#59c8ff"
          strokeWidth={9}
          strokeLinecap="round"
          style={{ opacity: 0, filter: "blur(3px)", transition: "opacity 200ms" }}
        />
        {/* track + progress */}
        <path d={arcPath} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={5} strokeLinecap="round" />
        <path
          ref={arcRef}
          d={arcPath}
          fill="none"
          stroke="url(#speedo-grad)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={GAUGE_ARC}
          strokeDashoffset={GAUGE_ARC}
        />
        <defs>
          <linearGradient id="speedo-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* needle */}
        <g ref={needleRef} transform="rotate(150, 50, 55)">
          <line x1={50} y1={55} x2={79} y2={55} stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={50} cy={55} r={4} fill="#ffffff" />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span ref={numRef} className="font-mono text-xl font-bold leading-none">0</span>
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white/50">km/h</span>
      </div>
      <span
        ref={driftRef}
        className="absolute left-1/2 top-5 -translate-x-1/2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber-300 transition-opacity"
        style={{ opacity: 0 }}
      >
        drift
      </span>
      <span
        ref={revRef}
        className="absolute right-4 top-9 font-mono text-[10px] font-bold text-white/70 transition-opacity"
        style={{ opacity: 0 }}
      >
        R
      </span>
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
        <Legend keys="H" label="Horn" />
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
