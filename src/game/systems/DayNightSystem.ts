import Phaser from "phaser";
import { frame } from "../state/gameStore";

// A day/night cycle as a single camera-fixed MULTIPLY rectangle — one draw
// call, and it keeps the hand-drawn paper aesthetic (Light2D would fight it).
// Exposes `nightness` so AmbientWorldSystem can swell lamp/window glows, and
// writes frame.timeOfDay for the HUD clock chip. Dev builds: N fast-forwards.

const CYCLE_MS = 5 * 60 * 1000;

interface Keyframe {
  t: number; // 0..1 position in the cycle
  color: { r: number; g: number; b: number };
  alpha: number;
}

// midday → dusk → night → dawn → midday
const KEYS: Keyframe[] = [
  { t: 0.0, color: { r: 255, g: 255, b: 255 }, alpha: 0 },
  { t: 0.32, color: { r: 255, g: 217, b: 160 }, alpha: 0.22 },
  { t: 0.45, color: { r: 52, g: 63, b: 92 }, alpha: 0.42 },
  { t: 0.62, color: { r: 52, g: 63, b: 92 }, alpha: 0.42 },
  { t: 0.75, color: { r: 255, g: 201, b: 176 }, alpha: 0.24 },
  { t: 0.88, color: { r: 255, g: 255, b: 255 }, alpha: 0 },
  { t: 1.0, color: { r: 255, g: 255, b: 255 }, alpha: 0 },
];

export class DayNightSystem {
  private readonly scene: Phaser.Scene;
  private readonly tint: Phaser.GameObjects.Rectangle;
  private elapsed = CYCLE_MS * 0.1; // start mid-morning
  /** 0 at noon → 1 deep night; consumed by AmbientWorldSystem */
  nightness = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tint = scene.add
      .rectangle(0, 0, 4, 4, 0xffffff, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setDepth(90000) // above the world, below canvas banners (99xxx)
      .setAlpha(0);

    if (import.meta.env.DEV) {
      scene.input.keyboard?.on("keydown-N", () => {
        this.elapsed += CYCLE_MS / 8;
      });
    }
  }

  destroy() {
    this.tint.destroy();
  }

  update(delta: number) {
    this.elapsed = (this.elapsed + delta) % CYCLE_MS;
    const t = this.elapsed / CYCLE_MS;
    frame.timeOfDay = t;

    let a = KEYS[0];
    let b = KEYS[KEYS.length - 1];
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (t >= KEYS[i].t && t <= KEYS[i + 1].t) {
        a = KEYS[i];
        b = KEYS[i + 1];
        break;
      }
    }
    const k = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
    const lerp = (x: number, y: number) => x + (y - x) * k;
    const r = Math.round(lerp(a.color.r, b.color.r));
    const g = Math.round(lerp(a.color.g, b.color.g));
    const bl = Math.round(lerp(a.color.b, b.color.b));
    const alpha = lerp(a.alpha, b.alpha);
    this.nightness = Phaser.Math.Clamp((alpha - 0.1) / 0.4, 0, 1);

    // MULTIPLY toward the key colour: blend white → colour by alpha
    const mix = (c: number) => Math.round(255 + (c - 255) * Math.min(1, alpha * 2));
    this.tint.setFillStyle(Phaser.Display.Color.GetColor(mix(r), mix(g), mix(bl)), 1);
    this.tint.setAlpha(alpha > 0.01 ? 1 : 0);

    // keep the rect covering the view despite camera zoom
    const cam = this.scene.cameras.main;
    const z = cam.zoom;
    this.tint.setPosition((0 - cam.width / 2) / z + cam.width / 2, (0 - cam.height / 2) / z + cam.height / 2);
    this.tint.setSize(cam.width / z + 4, cam.height / z + 4);
  }
}
