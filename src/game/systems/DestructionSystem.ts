import Phaser from "phaser";
import type { AudioSystem } from "./AudioSystem";

// Reactive-world effects: smashing crates/barrels into debris + dust, leaves
// when bombing through bushes, splashes through puddles. Driven by the scene's
// Matter collision handler.

export class DestructionSystem {
  private scene: Phaser.Scene;
  private audio: AudioSystem;
  private dust: Phaser.GameObjects.Particles.ParticleEmitter;
  private leaves: Phaser.GameObjects.Particles.ParticleEmitter;
  private splash: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, audio: AudioSystem) {
    this.scene = scene;
    this.audio = audio;

    this.dust = scene.add
      .particles(0, 0, "soft", {
        tint: 0xcbb58f,
        speed: { min: 30, max: 150 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 550,
        emitting: false,
      })
      .setDepth(99998);

    this.leaves = scene.add
      .particles(0, 0, "soft", {
        tint: 0x4e9e6a,
        speed: { min: 40, max: 130 },
        scale: { start: 0.5, end: 0 },
        lifespan: 600,
        emitting: false,
      })
      .setDepth(99998);

    this.splash = scene.add
      .particles(0, 0, "splash", {
        speed: { min: 40, max: 160 },
        scale: { start: 0.9, end: 0 },
        lifespan: 450,
        emitting: false,
      })
      .setDepth(99998);
  }

  smash(img: Phaser.GameObjects.Image, impact: number) {
    const x = img.x;
    const y = img.y;
    this.dust.emitParticleAt(x, y, 16);
    this.audio.crash(Math.min(1, impact / 6));
    this.scene.cameras.main.shake(140, 0.004 + Math.min(0.006, impact * 0.001));
    img.destroy();
  }

  bushRustle(x: number, y: number) {
    this.leaves.emitParticleAt(x, y, 10);
  }

  puddleSplash(x: number, y: number) {
    this.splash.emitParticleAt(x, y, 12);
  }

  thud(x: number, y: number, impact: number) {
    this.dust.emitParticleAt(x, y, 6);
    this.audio.crash(Math.min(0.6, impact / 8));
    this.scene.cameras.main.shake(90, 0.003);
  }

  /** continuous drift dust at the rear wheels */
  driftPuff(x: number, y: number) {
    this.dust.emitParticleAt(x, y, 1);
  }
}
