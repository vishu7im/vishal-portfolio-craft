import { useEffect, useRef } from "react";
import { WORLD, CHAPTERS } from "@/game/world";
import { frame, gameStore } from "@/game/state/gameStore";
import { PALETTE } from "@/game/config/palette";

const MAP_W = 196;
const MAP_H = Math.round((MAP_W * WORLD.bounds.h) / WORLD.bounds.w);
const SX = MAP_W / WORLD.bounds.w;
const SY = MAP_H / WORLD.bounds.h;

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // click to fast-travel to the nearest area node
  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * MAP_W;
    const my = (e.clientY - rect.top) / rect.height * MAP_H;
    let best: { x: number; y: number } | null = null;
    let bestD = 22;
    for (const n of WORLD.fastTravel) {
      const d = Math.hypot(n.x * SX - mx, n.y * SY - my);
      if (d < bestD) {
        bestD = d;
        best = { x: n.x, y: n.y };
      }
    }
    if (best) frame.requestTravel = best;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = MAP_W * dpr;
    canvas.height = MAP_H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, MAP_W, MAP_H);

      // area patches
      for (const a of WORLD.areas) {
        ctx.fillStyle = a.palette.ground;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(
          a.center.x * SX,
          a.center.y * SY,
          (a.footprint.w * SX) / 2.2,
          (a.footprint.h * SY) / 2.2,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // roads (the Career Road spine is drawn wider, then progress-filled)
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const r of WORLD.roads) {
        ctx.strokeStyle = r.kind === "dirt" ? "#b79366" : PALETTE.road;
        ctx.lineWidth = r.spine ? 3.6 : 2.2;
        ctx.beginPath();
        r.points.forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x * SX, p.y * SY) : ctx.lineTo(p.x * SX, p.y * SY)
        );
        ctx.stroke();
      }

      // journey progress: fill the spine up to the furthest chapter visited
      const visited = gameStore.getState().chaptersVisited;
      let maxOrder = 0;
      for (const ch of CHAPTERS) {
        if (visited.includes(ch.areaId)) maxOrder = Math.max(maxOrder, ch.order);
      }
      const spine = WORLD.roads.find((r) => r.spine);
      if (spine && maxOrder > 1) {
        ctx.strokeStyle = "#f2b843";
        ctx.lineWidth = 2;
        ctx.beginPath();
        spine.points.slice(0, maxOrder).forEach((p, i) =>
          i === 0 ? ctx.moveTo(p.x * SX, p.y * SY) : ctx.lineTo(p.x * SX, p.y * SY)
        );
        ctx.stroke();
      }

      // anchors
      for (const an of WORLD.anchors) {
        const area = WORLD.areas.find((a) => a.id === an.areaId);
        ctx.fillStyle = area?.palette.accent ?? "#2f6df0";
        ctx.beginPath();
        ctx.arc(an.x * SX, an.y * SY, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // chapter nodes: numbered along the Career Road, gold once visited
      for (const ch of CHAPTERS) {
        const area = WORLD.areas.find((a) => a.id === ch.areaId);
        if (!area) continue;
        const x = area.center.x * SX;
        const y = area.center.y * SY;
        const seen = visited.includes(ch.areaId);
        ctx.fillStyle = seen ? "#f2b843" : "rgba(255,255,255,0.55)";
        ctx.strokeStyle = "rgba(32,36,44,0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#20242c";
        ctx.font = "700 7px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(ch.order), x, y + 0.5);
      }

      // player
      const px = frame.playerX * SX;
      const py = frame.playerY * SY;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(frame.heading + Math.PI / 2);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#20242c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3.5, 4);
      ctx.lineTo(-3.5, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="glass pointer-events-auto absolute bottom-4 right-4 overflow-hidden rounded-2xl p-1.5">
      <canvas
        ref={canvasRef}
        onClick={onClick}
        style={{ width: MAP_W, height: MAP_H, display: "block", cursor: "pointer", borderRadius: 12 }}
      />
      <p className="pointer-events-none absolute bottom-1.5 left-2 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">
        tap area to travel
      </p>
    </div>
  );
}
