import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, FileText, Keyboard, Volume2, VolumeX } from "lucide-react";
import { gameStore, useGameStore } from "@/game/state/gameStore";
import { frame } from "@/game/state/gameStore";
import { WORLD, chapterFor } from "@/game/world";
import { LEVEL_TITLES } from "@/game/content/achievements";

const PAPER_VEIL =
  "radial-gradient(120% 90% at 50% 40%, #f6efe2 0%, #ece2d1 60%, #e3d7c2 100%)";

/**
 * Cinematic vignette (Phase 11 art pass) — a radial-gradient overlay that
 * darkens the corners for depth/focus and deepens after dark, driven by the
 * day/night `frame.nightness`. Done in CSS (not a WebGL post-FX) so it renders
 * identically on every device and never fights the in-canvas day/night tint. It
 * sits below the HUD (z-[5]) so only the world dims, never the readouts.
 */
export function WorldVignette() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) ref.current.style.opacity = (0.4 + frame.nightness * 0.46).toFixed(3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      data-vignette
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        opacity: 0.4,
        background:
          "radial-gradient(ellipse 80% 80% at 50% 47%, transparent 40%, rgba(14,17,28,0.5) 76%, rgba(9,11,20,0.9) 100%)",
      }}
    />
  );
}

/** Spinning progress ring shown while the world bakes its textures. */
function LoadingRing() {
  return (
    <div className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 48 48" className="h-14 w-14 animate-spin" style={{ animationDuration: "1.1s" }}>
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(91,83,70,0.18)" strokeWidth="4" />
        <path
          d="M24 4 a20 20 0 0 1 20 20"
          fill="none"
          stroke="#c98a3c"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#5b5346]">
        warming up the engine…
      </p>
    </div>
  );
}

/**
 * The arrival moment (docs/REDESIGN_ROADMAP.md, Phase 10): a full-screen paper
 * veil that shows a loading ring, then a start prompt with a controls summary
 * and a mute toggle. Pressing start inits audio on that gesture (via the store →
 * WorldScene) and paints the world in — the canvas irises open from the car
 * (see Game.tsx) while this veil fades. `#skip` bypasses it for dev.
 */
export function IntroOverlay() {
  const ready = useGameStore((s) => s.ready);
  const started = useGameStore((s) => s.started);
  const muted = useGameStore((s) => s.muted);
  const reduced = useGameStore((s) => s.reducedMotion);
  const [hidden, setHidden] = useState(false);

  // dev bypass: `?skip` (a query param, not a hash — the app uses HashRouter, so
  // a hash would be read as a route and never load the game)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.toLowerCase().includes("skip")) {
      gameStore.introStart();
    }
  }, []);

  // fade out then unmount once the world has been entered
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setHidden(true), reduced ? 150 : 650);
    return () => clearTimeout(t);
  }, [started, reduced]);

  // let a keypress start too (once the prompt is up), matching the click gesture
  useEffect(() => {
    if (!ready || started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        gameStore.introStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, started]);

  if (hidden) return null;

  return (
    <div
      className={`${started ? "pointer-events-none" : "pointer-events-auto"} absolute inset-0 z-50 grid place-items-center transition-opacity duration-500`}
      style={{ opacity: started ? 0 : 1, background: PAPER_VEIL }}
      aria-hidden={started}
    >
      {!ready ? (
        <LoadingRing />
      ) : (
        <div className="animate-fade-up flex max-w-[92vw] flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-[#8a7a5e]">
            Interactive Portfolio
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#20242c] sm:text-5xl">
            Vishal Munday
          </h1>
          <p className="mt-2 text-[15px] text-[#5b5346]">
            A little driving game. Explore the districts — each is a chapter of the work.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              ["W A S D", "Drive"],
              ["Shift", "Nitro"],
              ["E", "Interact"],
            ].map(([k, label]) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-[#20242c]/12 bg-white/55 px-3 py-1.5 text-xs font-medium text-[#3a4048]"
              >
                <kbd className="rounded bg-[#20242c] px-1.5 py-0.5 font-mono text-[10px] text-[#f4ede0]">
                  {k}
                </kbd>
                {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => gameStore.introStart()}
              className="rounded-full bg-[#20242c] px-7 py-3 text-sm font-semibold text-[#f4ede0] shadow-lg transition hover:bg-[#2f3540] active:scale-[0.98]"
            >
              Enter the world ▸
            </button>
            <Link
              to="/classic"
              className="inline-flex items-center gap-2 rounded-full border border-[#20242c]/15 bg-white/55 px-5 py-3 text-sm font-semibold text-[#3a4048] shadow-sm transition hover:bg-white/85 active:scale-[0.98]"
            >
              <FileText className="h-4 w-4" strokeWidth={1.9} />
              View résumé
            </Link>
            <button
              type="button"
              onClick={() => gameStore.toggleMute()}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#20242c]/12 bg-white/55 text-[#3a4048] transition hover:bg-white/80"
              aria-label={muted ? "Unmute" : "Mute"}
              title={muted ? "Sound off" : "Sound on"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-4 text-xs text-[#8a7a5e]">
            Prefer to read? The résumé has everything, no driving required.
          </p>
        </div>
      )}
    </div>
  );
}

/** Chapter title card whenever you cross into a new life chapter. */
export function AreaIntro() {
  const areaId = useGameStore((s) => s.currentArea);
  const started = useGameStore((s) => s.started);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  // wait for the world to be entered so the first chapter card lands with the
  // paint-in reveal rather than playing out behind the intro veil
  useEffect(() => {
    if (!started) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), first.current ? 3600 : 2800);
    first.current = false;
    return () => clearTimeout(t);
  }, [areaId, started]);

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

/** Persistent controls legend; users can collapse it, but a show chip remains. */
export function ControlsCard() {
  const [collapsed, setCollapsed] = useState(false);
  const ready = useGameStore((s) => s.ready);

  if (!ready) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="glass pointer-events-auto absolute bottom-4 left-1/2 flex h-10 -translate-x-1/2 items-center gap-2 rounded-full px-4 text-xs font-semibold text-white transition hover:bg-white/10"
        aria-label="Show controls"
        title="Show controls"
      >
        <Keyboard className="h-4 w-4" />
        Controls
        <ChevronUp className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className="glass pointer-events-auto absolute bottom-4 left-1/2 flex max-w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3 text-white"
      role="group"
      aria-label="Driving controls"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
        <Legend keys="W A S D" label="Drive" />
        <Legend keys="Space" label="Drift" />
        <Legend keys="Shift" label="Nitro" />
        <Legend keys="E" label="Interact" />
        <Legend keys="H" label="Horn" />
      </div>
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="Hide controls"
        title="Hide controls"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
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
