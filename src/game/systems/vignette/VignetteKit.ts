import Phaser from "phaser";
import { gameStore } from "../../state/gameStore";
import { PALETTE, hex } from "../../config/palette";

// Shared toolkit for the world "vignettes" — the little animated dioramas that
// bloom as you drive near them. Every scene factory (see ./scenes/*) receives a
// VignetteKit and uses its drawing helpers + particle emitters, so the ~20
// dioramas no longer live in one 1300-line class. Split out in Phase 2; drawing
// logic is unchanged. See docs/REDESIGN_ROADMAP.md.

export interface VignetteContext {
  carX: number;
  carY: number;
  time: number;
  delta: number;
}

export interface Vignette {
  id: string;
  x: number;
  y: number;
  radius: number;
  update(ctx: VignetteContext): void;
  destroy?(): void;
}

export const INK = hex(PALETTE.ink);
export const PAPER = hex(PALETTE.paper);
export const PANEL = 0x2a303b;
export const PANEL_2 = 0x39414f;
export const GREEN = 0x4ce0a0;
export const BLUE = 0x39a0f0;
export const PURPLE = 0x7b5cff;
export const ORANGE = 0xf0813a;
export const YELLOW = 0xf2b843;
export const RED = 0xe04f3f;
export const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
export const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const WHITE_STROKE = "#f4ede0";
const DARK_STROKE = "#20242c";

export function depthFor(y: number, offset = 0) {
  return 10 + y + offset;
}

export function clamp01(n: number) {
  return Phaser.Math.Clamp(n, 0, 1);
}

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export class VignetteKit {
  readonly scene: Phaser.Scene;
  readonly awarded = new Set<string>();

  readonly sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly smoke: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly confetti: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly codeBits: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly bugBits: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.sparks = scene.add
      .particles(0, 0, "sparkle", {
        speed: { min: 80, max: 260 },
        scale: { start: 0.9, end: 0 },
        lifespan: 560,
        quantity: 12,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);

    this.smoke = scene.add
      .particles(0, 0, "soft", {
        tint: 0x66707e,
        speed: { min: 18, max: 85 },
        scale: { start: 0.55, end: 1.8 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 1050,
        quantity: 4,
        emitting: false,
      })
      .setDepth(99998);

    this.confetti = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x4ce0a0, 0xf2b843, 0xf0813a, 0x7b5cff],
        speed: { min: 80, max: 240 },
        angle: { min: 230, max: 310 },
        gravityY: 180,
        scale: { start: 0.6, end: 0 },
        lifespan: 1000,
        quantity: 20,
        emitting: false,
      })
      .setDepth(99999);

    this.codeBits = scene.add
      .particles(0, 0, "soft", {
        tint: 0x4ce0a0,
        speed: { min: 35, max: 110 },
        scale: { start: 0.34, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 650,
        quantity: 5,
        emitting: false,
      })
      .setDepth(99998);

    this.bugBits = scene.add
      .particles(0, 0, "soft", {
        tint: [0xe04f3f, 0x4ce0a0, 0xf2b843],
        speed: { min: 70, max: 220 },
        scale: { start: 0.7, end: 0 },
        lifespan: 520,
        quantity: 16,
        emitting: false,
      })
      .setDepth(99998);
  }

  destroyParticles() {
    this.sparks.destroy();
    this.smoke.destroy();
    this.confetti.destroy();
    this.codeBits.destroy();
    this.bugBits.destroy();
  }

  proximity(ctx: VignetteContext, v: { x: number; y: number; radius: number }, inner = 150) {
    return clamp01(1 - (dist(ctx.carX, ctx.carY, v.x, v.y) - inner) / (v.radius - inner));
  }

  container(x: number, y: number, offset = 0) {
    return this.scene.add.container(x, y).setDepth(depthFor(y, offset));
  }

  rounded(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: number,
    alpha = 1,
    stroke = INK
  ) {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x151922, 0.18);
    shadow.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 10, w, h, 12);
    parent.add(shadow);

    const g = this.scene.add.graphics();
    g.fillStyle(fill, alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.fillStyle(0xffffff, alpha * 0.08);
    g.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, Math.max(16, h * 0.22), 9);
    g.lineStyle(2, stroke, 0.72);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    parent.add(g);
    return g;
  }

  floorDecal(
    parent: Phaser.GameObjects.Container,
    w: number,
    h: number,
    accent: number,
    alpha = 0.3,
    y = 0
  ) {
    const glow = this.scene.add
      .image(0, y, "glow")
      .setTint(accent)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(alpha * 0.9)
      .setScale(w / 128, h / 128);
    const g = this.scene.add.graphics();
    g.fillStyle(0x151922, 0.1);
    g.fillEllipse(0, y + h * 0.13, w * 0.9, h * 0.42);
    g.lineStyle(2, accent, alpha);
    g.strokeEllipse(0, y, w, h * 0.62);
    g.strokeEllipse(0, y, w * 0.72, h * 0.43);
    g.lineStyle(1, 0xffffff, alpha * 0.22);
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo((i * w) / 8, y - h * 0.26);
      g.lineTo((i * w) / 10, y + h * 0.26);
      g.strokePath();
    }
    parent.add([glow, g]);
    return { glow, g };
  }

  screenPanel(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    accent: number,
    alpha = 0.96
  ) {
    const shadow = this.scene.add.rectangle(x + 6, y + 7, w, h, 0x151922, 0.2);
    const panel = this.scene.add.rectangle(x, y, w, h, PANEL, alpha).setStrokeStyle(2, accent, 0.72);
    const sheen = this.scene.add.rectangle(x - w * 0.18, y - h * 0.25, w * 0.48, 3, 0xffffff, 0.2);
    parent.add([shadow, panel, sheen]);
    return panel;
  }

  chip(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    accent: number,
    w = Math.max(56, text.length * 7.5 + 18)
  ) {
    const box = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf4ede0, 0.92);
    bg.fillRoundedRect(-w / 2, -14, w, 28, 8);
    bg.lineStyle(1.5, accent, 0.72);
    bg.strokeRoundedRect(-w / 2, -14, w, 28, 8);
    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: FONT,
        fontSize: "10px",
        color: "#20242c",
        align: "center",
      })
      .setOrigin(0.5);
    box.add([bg, label]);
    parent.add(box);
    return box;
  }

  localText(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    size = 12,
    color = "#f4ede0",
    family = FONT
  ) {
    const t = this.scene.add
      .text(x, y, text, {
        fontFamily: family,
        fontSize: `${size}px`,
        color,
        align: "center",
        stroke: color === "#20242c" ? WHITE_STROKE : DARK_STROKE,
        strokeThickness: size <= 10 ? 2 : 3,
      })
      .setOrigin(0.5);
    parent.add(t);
    return t;
  }

  worldLabel(x: number, y: number, text: string, color = "#20242c") {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: SANS,
        fontSize: "13px",
        fontStyle: "700",
        color,
        align: "center",
        backgroundColor: "rgba(244,237,224,0.86)",
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setPadding(9, 4, 9, 4)
      .setDepth(depthFor(y, 80));
  }

  notice(x: number, y: number, text: string, tint = "#20242c") {
    const n = this.scene.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize: "14px",
        color: tint,
        align: "center",
        backgroundColor: "rgba(244,237,224,0.86)",
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setPadding(8, 5, 8, 5)
      .setDepth(100000);
    this.scene.tweens.add({
      targets: n,
      y: y - 54,
      alpha: 0,
      duration: 1350,
      ease: "Cubic.out",
      onComplete: () => n.destroy(),
    });
  }

  awardOnce(id: string, value: number, x: number, y: number, text: string) {
    const saveId = `world-vignette-${id}`;
    if (this.awarded.has(saveId) || gameStore.isCollected(saveId)) return;
    this.awarded.add(saveId);
    gameStore.collect(saveId, value);
    this.notice(x, y, `${text} +${value}`, "#20242c");
    this.sparks.emitParticleAt(x, y, 18);
  }
}
