import Phaser from "phaser";
import { PALETTE, type AreaId } from "../config/palette";
import { makeCanvasTexture } from "./textureFactory";

// Procedural utility textures (tileable ground, soft blobs, particles, marks).
// These are drawn directly to canvas — cheaper than SVG for simple radial/tiled
// art and used at explicit display sizes, so they sit outside the TEX_SS scheme.

export function buildGroundTextures(scene: Phaser.Scene): void {
  // Tileable warm-paper ground with a faint dot grid (mirrors .world-floor).
  makeCanvasTexture(scene, "ground", 128, 128, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.paper;
    ctx.fillRect(0, 0, w, h);
    // subtle vertical warmth
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0.02)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.dot;
    for (let y = 16; y < h; y += 32) {
      for (let x = 16; x < w; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // Soft radial blob — tinted per area to paint cozy region patches.
  makeCanvasTexture(scene, "area-blob", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,0.92)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Soft round particle for dust/smoke (tinted at emit time).
  makeCanvasTexture(scene, "soft", 32, 32, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Tire mark — a soft dark rounded streak.
  makeCanvasTexture(scene, "tiremark", 12, 18, (ctx, w, h) => {
    ctx.fillStyle = "rgba(30,32,38,0.55)";
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - r, 1);
    ctx.arcTo(w, 1, w, h / 2, r);
    ctx.arcTo(w, h - 1, w / 2, h - 1, r);
    ctx.arcTo(0, h - 1, 0, h / 2, r);
    ctx.arcTo(0, 1, w / 2, 1, r);
    ctx.fill();
  });

  // 4-point sparkle for pickups.
  makeCanvasTexture(scene, "sparkle", 32, 32, (ctx, w, h) => {
    const cx = w / 2,
      cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 2; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, -cy);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, cy);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  // Soft glow disc (reaction lights, window glow — tinted per area accent).
  makeCanvasTexture(scene, "glow", 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.4, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Round soft car shadow (detaches on jumps).
  makeCanvasTexture(scene, "car-shadow", 96, 56, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(22,26,34,0.34)");
    g.addColorStop(0.7, "rgba(22,26,34,0.18)");
    g.addColorStop(1, "rgba(22,26,34,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Splash droplet for puddles.
  makeCanvasTexture(scene, "splash", 16, 16, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(180,230,240,0.95)");
    g.addColorStop(1, "rgba(120,200,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

// --- distinct, soft-edged ground patch per area ---------------------------
// Each biome gets its own base colour + surface pattern so it reads as a real,
// different place rather than the same paper everywhere.

type PatternFn = (ctx: CanvasRenderingContext2D, w: number, h: number, rnd: () => number) => void;

function specks(color: string, count: number, size: number): PatternFn {
  return (ctx, w, h, rnd) => {
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const s = size * (0.5 + rnd());
      ctx.beginPath();
      ctx.ellipse(x, y, s, s * 1.8, rnd() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

function grid(color: string, step: number, lw: number): PatternFn {
  return (ctx, w, h) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };
}

function combine(...fns: PatternFn[]): PatternFn {
  return (ctx, w, h, rnd) => fns.forEach((f) => f(ctx, w, h, rnd));
}

const ripples: PatternFn = (ctx, w, h, rnd) => {
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  for (let y = 30; y < h; y += 46) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y + Math.sin((x + rnd() * 40) / 40) * 8);
    ctx.stroke();
  }
};

const stripes: PatternFn = (ctx, w, h) => {
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let y = 0; y < h; y += 96) ctx.fillRect(0, y, w, 48);
};

const glowDots = (color: string): PatternFn => (ctx, w, h, rnd) => {
  for (let i = 0; i < 40; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 9, y - 9, 18, 18);
  }
};

const AREA_GROUND: Record<AreaId, { base: string; pattern: PatternFn }> = {
  forest: { base: "#bcd9a6", pattern: specks("rgba(58,125,84,0.55)", 520, 2.2) },
  "tech-campus": { base: "#c9e0c0", pattern: combine(stripes, specks("rgba(90,150,110,0.4)", 260, 1.8)) },
  city: { base: "#d0d3da", pattern: combine(grid("rgba(90,100,120,0.18)", 46, 2), specks("rgba(90,100,120,0.12)", 120, 2)) },
  garage: { base: "#d8c8a8", pattern: combine(specks("rgba(120,95,60,0.28)", 60, 5), grid("rgba(120,95,60,0.1)", 90, 2)) },
  mountain: { base: "#ccd4de", pattern: combine(specks("rgba(120,130,150,0.4)", 130, 4), specks("rgba(255,255,255,0.7)", 300, 2)) },
  beach: { base: "#f1e0ac", pattern: combine(ripples, specks("rgba(200,170,110,0.35)", 200, 1.6)) },
  industrial: { base: "#b9ad95", pattern: combine(grid("rgba(80,68,52,0.22)", 60, 3), specks("rgba(70,58,44,0.3)", 90, 5)) },
  "research-lab": { base: "#d6ccf5", pattern: combine(grid("rgba(123,92,255,0.25)", 44, 2), glowDots("rgba(140,110,255,0.6)")) },
  "cloud-datacenter": { base: "#bfd4ea", pattern: combine(grid("rgba(57,160,240,0.28)", 44, 2), glowDots("rgba(80,180,255,0.7)")) },
};

export function buildAreaGround(scene: Phaser.Scene): void {
  const S = 512;
  let seed = 1;
  (Object.keys(AREA_GROUND) as AreaId[]).forEach((id) => {
    const { base, pattern } = AREA_GROUND[id];
    const s = seed++;
    let a = s * 9301 + 49297;
    const rnd = () => {
      a = (a * 9301 + 49297) % 233280;
      return a / 233280;
    };
    makeCanvasTexture(scene, `aground-${id}`, S, S, (ctx, w, h) => {
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      pattern(ctx, w, h, rnd);
      // soft radial mask so patches blend into the surrounding wilds
      ctx.globalCompositeOperation = "destination-in";
      const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w * 0.52);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(0.72, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    });
  });
}
