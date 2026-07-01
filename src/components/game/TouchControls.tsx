import { useEffect, useRef, useState } from "react";
import { setTouch, carInput } from "@/game/state/input";
import { useGameStore } from "@/game/state/gameStore";

// On-screen controls for touch devices: a left thumb-stick (steer + throttle/
// reverse) and right-hand action buttons (nitro, drift, interact).
export function TouchControls() {
  const [show, setShow] = useState(false);
  const nearLabel = useGameStore((s) => s.nearLabel);
  const focusedId = useGameStore((s) => s.focusedId);

  useEffect(() => {
    setShow("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const knobRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  const onStickMove = (e: React.PointerEvent) => {
    if (!baseRef.current) return;
    const r = baseRef.current.getBoundingClientRect();
    const R = r.width / 2;
    let dx = e.clientX - (r.left + R);
    let dy = e.clientY - (r.top + R);
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(1, len / R);
    dx = (dx / len) * cl;
    dy = (dy / len) * cl;
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx * R}px, ${dy * R}px)`;
    setTouch({
      steer: dx,
      throttle: dy < -0.15 ? Math.min(1, -dy * 1.3) : 0,
      reverse: dy > 0.2 ? Math.min(1, dy * 1.3) : 0,
    });
  };
  const onStickEnd = () => {
    if (knobRef.current) knobRef.current.style.transform = "translate(0,0)";
    setTouch({ steer: 0, throttle: 0, reverse: 0 });
  };

  if (!show) return null;

  const hold = (patch: Parameters<typeof setTouch>[0]) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setTouch(patch);
    },
    onPointerUp: () => setTouch(Object.fromEntries(Object.keys(patch).map((k) => [k, false])) as never),
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-30 select-none">
      {/* steering + throttle stick */}
      <div
        ref={baseRef}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          onStickMove(e);
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && onStickMove(e)}
        onPointerUp={onStickEnd}
        onPointerCancel={onStickEnd}
        className="glass pointer-events-auto absolute bottom-6 left-6 grid h-36 w-36 touch-none place-items-center rounded-full"
        style={{ touchAction: "none" }}
      >
        <div ref={knobRef} className="h-16 w-16 rounded-full bg-white/80 shadow-lg transition-transform" />
      </div>

      {/* action buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3" style={{ touchAction: "none" }}>
        {nearLabel && !focusedId && (
          <button
            onPointerDown={() => (carInput.interact = true)}
            className="glass pointer-events-auto grid h-16 w-16 place-items-center rounded-full text-lg font-bold text-white"
          >
            E
          </button>
        )}
        <div className="flex gap-3">
          <button
            {...hold({ handbrake: true })}
            className="glass pointer-events-auto grid h-16 w-16 place-items-center rounded-full text-xs font-bold text-white"
          >
            DRIFT
          </button>
          <button
            {...hold({ nitro: true })}
            className="glass pointer-events-auto grid h-20 w-20 place-items-center rounded-full text-sm font-bold text-amber-200"
          >
            NITRO
          </button>
        </div>
      </div>
    </div>
  );
}
