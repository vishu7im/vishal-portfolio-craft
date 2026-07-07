import Phaser from "phaser";
import type { CarController } from "../CarController";
import type { DayNightSystem } from "../DayNightSystem";
import type { AudioSystem } from "../AudioSystem";
import { PALETTE, hex } from "../../config/palette";

export const INK = hex(PALETTE.ink);

// Shared context for the ambient world modules (see ./*.ts). Owns the resources
// several feature modules need in common — the scene/car/dayNight/audio refs,
// the five ambient particle emitters, and a couple of shared one-shot effects
// (ripple, lightning). Split out of the old 1100-line AmbientWorldSystem in
// Phase 2; behavior unchanged. See docs/REDESIGN_ROADMAP.md.
export class AmbientKit {
  readonly scene: Phaser.Scene;
  readonly car: CarController;
  readonly dayNight?: DayNightSystem;
  readonly audio?: AudioSystem;

  readonly leaves: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly petals: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly dust: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  readonly smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, car: CarController, dayNight?: DayNightSystem, audio?: AudioSystem) {
    this.scene = scene;
    this.car = car;
    this.dayNight = dayNight;
    this.audio = audio;

    this.leaves = scene.add
      .particles(0, 0, "soft", {
        tint: [0x4e9e6a, 0xcfe3bf, 0xf2b843],
        speed: { min: 20, max: 90 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.75, end: 0 },
        lifespan: 1000,
        gravityY: 24,
        emitting: false,
      })
      .setDepth(99990);

    this.petals = scene.add
      .particles(0, 0, "soft", {
        tint: [0xf7a6c8, 0xffd6e6, 0xf2e6cf],
        speed: { min: 24, max: 100 },
        scale: { start: 0.24, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 760,
        gravityY: 18,
        emitting: false,
      })
      .setDepth(99990);

    this.dust = scene.add
      .particles(0, 0, "soft", {
        tint: 0xcbb58f,
        speed: { min: 12, max: 46 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.35, end: 0 },
        lifespan: 900,
        emitting: false,
      })
      .setDepth(99980);

    this.sparks = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x4ce0a0, 0xf2b843],
        speed: { min: 22, max: 90 },
        scale: { start: 0.38, end: 0 },
        lifespan: 520,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99990);

    this.smoke = scene.add
      .particles(0, 0, "soft", {
        tint: 0x66707e,
        speed: { min: 8, max: 42 },
        scale: { start: 0.45, end: 1.5 },
        alpha: { start: 0.28, end: 0 },
        lifespan: 1600,
        emitting: false,
      })
      .setDepth(99970);
  }

  /** expanding water ripple ring (puddles, rain) */
  spawnRipple(x: number, y: number, scale: number) {
    const ring = this.scene.add.ellipse(x, y, 44 * scale, 24 * scale).setStrokeStyle(2, 0xffffff, 0.34).setDepth(10 + y - 2);
    this.scene.tweens.add({
      targets: ring,
      scale: 1.8,
      alpha: 0,
      duration: 900,
      ease: "Sine.out",
      onComplete: () => ring.destroy(),
    });
  }

  /** a lightning bolt + camera flash (storms and the world-event roulette) */
  spawnLightning() {
    const x = Phaser.Math.Between(900, 8500);
    const y = Phaser.Math.Between(700, 5400);
    const bolt = this.scene.add.graphics().setDepth(99994);
    bolt.lineStyle(5, 0xded6ff, 0.95);
    bolt.beginPath();
    bolt.moveTo(x, y - 240);
    bolt.lineTo(x + 32, y - 140);
    bolt.lineTo(x - 12, y - 70);
    bolt.lineTo(x + 20, y);
    bolt.strokePath();
    this.scene.cameras.main.flash(90, 230, 222, 255, false);
    this.sparks.emitParticleAt(x + 20, y, 18);
    this.scene.tweens.add({ targets: bolt, alpha: 0, duration: 260, onComplete: () => bolt.destroy() });
  }

  destroyEmitters() {
    this.leaves.destroy();
    this.petals.destroy();
    this.dust.destroy();
    this.sparks.destroy();
    this.smoke.destroy();
  }
}
