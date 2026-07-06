import Phaser from "phaser";
import { WORLD } from "../world";
import { mulberry32 } from "../world/scatter";

// Live "ops screens" floating beside key buildings: a req/sec sparkline, a
// latency ticker and scrolling log lines. Visuals replace panel text — you see
// the systems running instead of reading about them. Each screen is a canvas
// texture redrawn at ~4 Hz, and only while inside the camera view.

interface Screen {
  key: string;
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  flavor: "api" | "factory" | "saas" | "ai";
  series: number[];
  rng: () => number;
  logIx: number;
}

const W = 176;
const H = 104;
const REDRAW_MS = 250;

const LOGS: Record<Screen["flavor"], string[]> = {
  api: ["POST /bookings 201 34ms", "GET /rooms 200 12ms", "webhook stripe ok", "cache hit 94%", "GET /invoices 200 18ms"],
  factory: ["job#4812 reconciled ✓", "queue depth 12", "worker-3 idle", "batch 220/220 done", "ledger synced"],
  saas: ["tenant acme provisioned", "deploy v2.4.1 green", "ws clients 1.2k", "billing cron ok", "p99 88ms"],
  ai: ["stt 180ms → llm 640ms", "tts stream open", "rag top-k=5 hit", "tool call: search()", "session live 03:12"],
};

const ACCENT: Record<Screen["flavor"], string> = {
  api: "#4ce0a0",
  factory: "#f2b843",
  saas: "#39a0f0",
  ai: "#8c7cff",
};

/** which building anchors get a screen, and their data flavour */
const PLACEMENTS: Array<{ anchorId: string; flavor: Screen["flavor"]; dx: number; dy: number }> = [
  { anchorId: "anchor-proj-bnb", flavor: "api", dx: 150, dy: -60 },
  { anchorId: "anchor-proj-easysupply", flavor: "factory", dx: 175, dy: -70 },
  { anchorId: "anchor-proj-aaxel", flavor: "factory", dx: 175, dy: -70 },
  { anchorId: "anchor-proj-fabricator", flavor: "saas", dx: 160, dy: -90 },
  { anchorId: "anchor-proj-metaos", flavor: "saas", dx: 145, dy: -70 },
  { anchorId: "anchor-proj-kiki", flavor: "ai", dx: 215, dy: -100 },
  { anchorId: "anchor-exp-edgenroots", flavor: "saas", dx: 140, dy: -75 },
];

export class ScreenDisplaySystem {
  private readonly scene: Phaser.Scene;
  private readonly screens: Screen[] = [];
  private lastDraw = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (const p of PLACEMENTS) {
      const anchor = WORLD.anchors.find((a) => a.id === p.anchorId);
      if (!anchor) continue;
      const key = `opscreen-${p.anchorId}`;
      const x = anchor.x + p.dx;
      const y = anchor.y + p.dy;
      const rng = mulberry32(anchor.x ^ anchor.y);
      const tex = scene.textures.createCanvas(key, W, H);
      if (!tex) continue;
      const img = scene.add.image(x, y, key).setDepth(10 + y + 40).setAlpha(0.94);
      this.screens.push({
        key,
        img,
        x,
        y,
        flavor: p.flavor,
        series: Array.from({ length: 28 }, () => 0.3 + rng() * 0.5),
        rng,
        logIx: Math.floor(rng() * 5),
      });
    }
  }

  destroy() {
    for (const s of this.screens) {
      s.img.destroy();
      this.scene.textures.remove(s.key);
    }
  }

  update(time: number) {
    if (time - this.lastDraw < REDRAW_MS) return;
    this.lastDraw = time;
    const view = this.scene.cameras.main.worldView;
    for (const s of this.screens) {
      const visible = view.contains(s.x, s.y);
      s.img.setVisible(visible);
      if (!visible) continue;
      s.series.shift();
      s.series.push(0.25 + s.rng() * 0.6);
      if (s.rng() < 0.4) s.logIx = (s.logIx + 1) % LOGS[s.flavor].length;
      this.draw(s);
    }
  }

  private draw(s: Screen) {
    const tex = this.scene.textures.get(s.key) as Phaser.Textures.CanvasTexture;
    const ctx = tex.getContext();
    const accent = ACCENT[s.flavor];

    ctx.clearRect(0, 0, W, H);
    // bezel + screen
    ctx.fillStyle = "rgba(21,25,34,0.92)";
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 10);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // header: req/s + latency
    const req = Math.round(120 + s.series[s.series.length - 1] * 900);
    const lat = Math.round(18 + s.series[s.series.length - 2] * 70);
    ctx.font = "700 11px ui-monospace, monospace";
    ctx.fillStyle = accent;
    ctx.fillText(`${req} req/s`, 10, 18);
    ctx.fillStyle = "#dbe6ef";
    ctx.fillText(`p95 ${lat}ms`, 100, 18);

    // sparkline
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    s.series.forEach((v, i) => {
      const px = 10 + (i / (s.series.length - 1)) * (W - 20);
      const py = 58 - v * 30;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // log lines
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = "rgba(219,230,239,0.75)";
    const logs = LOGS[s.flavor];
    ctx.fillText(`> ${logs[s.logIx]}`, 10, 78);
    ctx.fillStyle = "rgba(219,230,239,0.45)";
    ctx.fillText(`> ${logs[(s.logIx + 1) % logs.length]}`, 10, 93);

    tex.refresh();
  }
}
