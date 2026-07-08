import Phaser from "phaser";
import { frame } from "../state/gameStore";
import { clamp } from "../core/maths";
import { Cycles, type CycleStep } from "../core/Cycles";
import { DAY_CYCLE } from "../config/palette";
import type { AudioSystem } from "./AudioSystem";

// A day/night cycle as a single camera-fixed MULTIPLY rectangle — one draw call,
// and it keeps the hand-drawn paper aesthetic (Light2D would fight it). The
// mood — tint color, overlay strength, and nightness — is now keyframed by the
// ported `Cycles` engine (docs/REDESIGN_ROADMAP.md, Phase 8) from the DAY_CYCLE
// presets, so the world smoothly recolors day → dusk → night → dawn instead of
// blending a hardcoded table. `nightness` (0 noon → 1 deep night) is consumed by
// AmbientWorldSystem/CarFx to swell lamp/window glows; a `night` interval event
// swaps in a gentle ambient bed. Dev builds: N fast-forwards.

const CYCLE_MS = 5 * 60 * 1000;

// midday → day → dusk → night → night → dawn → day (wraps back to midday).
// Night is held around t≈0.45–0.62 to keep the HUD clock chip's icon windows
// (HudExtras.ClockChip) accurate without re-deriving them.
const { day, dusk, night, dawn } = DAY_CYCLE;
const KEYFRAMES: CycleStep[] = [
  { stop: 0.0, properties: { ...day } },
  { stop: 0.15, properties: { ...day } },
  { stop: 0.3, properties: { ...dusk } },
  { stop: 0.45, properties: { ...night } },
  { stop: 0.62, properties: { ...night } },
  { stop: 0.78, properties: { ...dawn } },
  { stop: 0.9, properties: { ...day } },
];

export class DayNightSystem {
  private readonly scene: Phaser.Scene;
  private readonly tint: Phaser.GameObjects.Rectangle;
  private readonly cycle: Cycles;
  /** 0 at noon → 1 deep night; consumed by AmbientWorldSystem */
  nightness = 0;

  constructor(scene: Phaser.Scene, audio?: AudioSystem) {
    this.scene = scene;
    this.cycle = new Cycles({
      durationMs: CYCLE_MS,
      startProgress: 0.1, // start mid-morning
      keyframes: KEYFRAMES,
      intervals: [{ name: "night", start: 0.42, end: 0.64 }],
    });

    // ambient audio swaps by phase — the reference ties loops to cycle intervals
    if (audio) {
      this.cycle.events.on("night", (active) => audio.setNightAmbience(active as boolean));
    }

    this.tint = scene.add
      .rectangle(0, 0, 4, 4, 0xffffff, 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setDepth(90000) // above the world, below canvas banners (99xxx)
      .setAlpha(0);

    if (import.meta.env.DEV) {
      scene.input.keyboard?.on("keydown-N", () => {
        this.cycle.advance(CYCLE_MS / 8);
      });
    }
  }

  destroy() {
    this.tint.destroy();
  }

  update(delta: number) {
    this.cycle.advance(delta);
    frame.timeOfDay = this.cycle.progress;

    const tint = this.cycle.color("tint");
    const overlay = this.cycle.num("overlay");
    this.nightness = clamp(this.cycle.num("nightness"), 0, 1);
    frame.nightness = this.nightness; // consumed by the CSS vignette overlay

    // MULTIPLY toward the key colour: blend white → colour by overlay strength
    const mix = (c: number) => Math.round(255 + (c - 255) * Math.min(1, overlay * 2));
    this.tint.setFillStyle(
      Phaser.Display.Color.GetColor(mix(tint.r), mix(tint.g), mix(tint.b)),
      1
    );
    this.tint.setAlpha(overlay > 0.01 ? 1 : 0);

    // oversize + centre the rect so camera zoom AND the drift tilt never expose corners
    const cam = this.scene.cameras.main;
    const z = cam.zoom;
    const w = (cam.width / z) * 1.45;
    const h = (cam.height / z) * 1.45;
    this.tint.setPosition(cam.width / 2 - w / 2, cam.height / 2 - h / 2);
    this.tint.setSize(w, h);
  }
}
