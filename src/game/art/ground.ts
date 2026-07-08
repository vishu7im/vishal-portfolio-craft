import Phaser from "phaser";
import { type AreaId } from "../config/palette";
import { makeCanvasTexture } from "./textureFactory";

// Procedural utility textures (tileable ground, soft blobs, particles, marks).
// These are drawn directly to canvas — cheaper than SVG for simple radial/tiled
// art and used at explicit display sizes, so they sit outside the TEX_SS scheme.

export function buildGroundTextures(scene: Phaser.Scene): void {
  // Tileable warm base ground. Shows only in the "wilds" between area patches, so
  // it stays subtle — but with fine multi-tone grain + a faint dot grid so it
  // reads as textured earth rather than dead-flat paper.
  makeCanvasTexture(scene, "ground", 128, 128, (ctx, w, h) => {
    ctx.fillStyle = "#e7ddc8";
    ctx.fillRect(0, 0, w, h);
    // fine organic grain (two tones), wrapped so the tile still seams cleanly
    let a = 987654321;
    const rnd = () => ((a = (a * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (const [color, count, size] of [
      ["rgba(120,104,74,0.10)", 260, 1.4],
      ["rgba(255,250,235,0.16)", 200, 1.2],
    ] as const) {
      ctx.fillStyle = color;
      for (let i = 0; i < count; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, size * (0.6 + rnd()), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = "rgba(20,24,32,0.04)";
    for (let y = 16; y < h; y += 32)
      for (let x = 16; x < w; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.1, 0, Math.PI * 2);
        ctx.fill();
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

// Big soft tonal blotches → terrain-like variation instead of one flat colour.
function blotches(colors: string[], count: number): PatternFn {
  return (ctx, w, h, rnd) => {
    for (let i = 0; i < count; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      const r = w * (0.14 + rnd() * 0.2);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, colors[i % colors.length]);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  };
}

// Tiny two-tone flower dots for meadow biomes.
function flowers(cols: string[], count: number): PatternFn {
  return (ctx, w, h, rnd) => {
    for (let i = 0; i < count; i++) {
      const x = rnd() * w;
      const y = rnd() * h;
      ctx.fillStyle = cols[(rnd() * cols.length) | 0];
      ctx.beginPath();
      ctx.arc(x, y, 1.4 + rnd() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

// Each biome: a vertical light→deep gradient (dimensional lighting) + soft tonal
// blotches + layered detail. Saturated, richer, and clearly different per place.
const AREA_GROUND: Record<AreaId, { top: string; bottom: string; pattern: PatternFn }> = {
  forest: {
    top: "#8fc16a", bottom: "#5c9a49",
    pattern: combine(
      blotches(["rgba(64,138,74,0.5)", "rgba(150,196,120,0.45)"], 7),
      specks("rgba(48,110,64,0.5)", 460, 2.1),
      specks("rgba(190,222,150,0.4)", 180, 1.6),
      flowers(["#f2d24b", "#ef6d8a", "#f4ede0"], 46)
    ),
  },
  "tech-campus": {
    top: "#8ad4c6", bottom: "#4f9f92",
    pattern: combine(
      blotches(["rgba(120,200,186,0.4)", "rgba(70,150,140,0.4)"], 6),
      stripes,
      specks("rgba(60,140,128,0.4)", 220, 1.8)
    ),
  },
  city: {
    top: "#c6ccda", bottom: "#98a0b4",
    pattern: combine(
      blotches(["rgba(150,158,178,0.4)", "rgba(120,128,150,0.35)"], 5),
      grid("rgba(70,80,102,0.22)", 46, 2),
      specks("rgba(80,90,112,0.18)", 130, 2)
    ),
  },
  garage: {
    top: "#e3cb93", bottom: "#b7924f",
    pattern: combine(
      blotches(["rgba(150,120,72,0.4)", "rgba(210,182,130,0.4)"], 6),
      specks("rgba(120,92,52,0.32)", 90, 4.5),
      grid("rgba(110,84,48,0.14)", 90, 2)
    ),
  },
  mountain: {
    top: "#d6dce8", bottom: "#a3aec2",
    pattern: combine(
      blotches(["rgba(150,160,182,0.45)", "rgba(232,238,248,0.6)"], 6),
      specks("rgba(110,122,146,0.4)", 150, 3.6),
      specks("rgba(255,255,255,0.8)", 320, 1.9)
    ),
  },
  beach: {
    top: "#f4dc8e", bottom: "#dcb45f",
    pattern: combine(
      blotches(["rgba(240,214,140,0.5)", "rgba(122,196,214,0.4)"], 6),
      ripples,
      specks("rgba(198,164,100,0.4)", 220, 1.6)
    ),
  },
  industrial: {
    top: "#c6b58f", bottom: "#8c7a58",
    pattern: combine(
      blotches(["rgba(120,104,74,0.45)", "rgba(190,120,72,0.3)"], 6),
      grid("rgba(70,58,42,0.24)", 60, 3),
      specks("rgba(64,52,38,0.32)", 100, 4.5)
    ),
  },
  "research-lab": {
    top: "#c6a6f2", bottom: "#8f66e0",
    pattern: combine(
      blotches(["rgba(160,120,255,0.45)", "rgba(120,80,220,0.4)"], 6),
      grid("rgba(150,110,255,0.3)", 44, 2),
      glowDots("rgba(180,140,255,0.75)")
    ),
  },
  "cloud-datacenter": {
    top: "#a6cef4", bottom: "#6aa2e0",
    pattern: combine(
      blotches(["rgba(120,180,240,0.45)", "rgba(80,150,220,0.4)"], 6),
      grid("rgba(70,160,240,0.3)", 44, 2),
      glowDots("rgba(120,200,255,0.8)")
    ),
  },
};

export function buildAreaGround(scene: Phaser.Scene): void {
  const S = 512;
  let seed = 1;
  (Object.keys(AREA_GROUND) as AreaId[]).forEach((id) => {
    const { top, bottom, pattern } = AREA_GROUND[id];
    const s = seed++;
    let a = s * 9301 + 49297;
    const rnd = () => {
      a = (a * 9301 + 49297) % 233280;
      return a / 233280;
    };
    makeCanvasTexture(scene, `aground-${id}`, S, S, (ctx, w, h) => {
      // dimensional light→deep vertical gradient base
      const vg = ctx.createLinearGradient(0, 0, 0, h);
      vg.addColorStop(0, top);
      vg.addColorStop(1, bottom);
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
      pattern(ctx, w, h, rnd);
      // gentle baked ambient occlusion toward the patch edge for depth
      const ao = ctx.createRadialGradient(w / 2, h * 0.42, w * 0.2, w / 2, h / 2, w * 0.6);
      ao.addColorStop(0, "rgba(0,0,0,0)");
      ao.addColorStop(1, "rgba(20,26,20,0.22)");
      ctx.fillStyle = ao;
      ctx.fillRect(0, 0, w, h);
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
