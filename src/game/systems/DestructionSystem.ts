import Phaser from "phaser";
import { gameStore } from "../state/gameStore";
import { TUNING } from "../config/tuning";
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
  private boost: Phaser.GameObjects.Particles.ParticleEmitter;
  private blast: Phaser.GameObjects.Particles.ParticleEmitter;

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

    this.boost = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x4ce0a0, 0x39a0f0, 0xf2b843],
        speed: { min: 90, max: 280 },
        scale: { start: 0.75, end: 0 },
        lifespan: 520,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);

    this.blast = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0xf2b843, 0xf0813a, 0xe04f3f, 0xf4ede0],
        speed: { min: 130, max: 360 },
        scale: { start: 0.9, end: 0 },
        lifespan: 650,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);
  }

  smash(img: Phaser.GameObjects.Image, impact: number): boolean {
    if (img.getData("destroyed")) return false;
    img.setData("destroyed", true);

    const x = img.x;
    const y = img.y;
    const pan = this.panAt(x);
    // burst density scales with impact so a fast smash reads visibly bigger
    const force = Phaser.Math.Clamp(impact / 6, 0, 1);
    this.dust.emitParticleAt(x, y, Math.round(16 + force * 20));
    this.blast.emitParticleAt(x, y, Math.round(18 + force * 22));
    this.spawnDebris(x, y, img.rotation, force);
    this.audio.crash(Math.min(1, impact / 6), pan);
    if (force > 0.75) this.audio.boom(force, pan); // low-end punch on the hardest smashes

    // crates & barrels pay out a little XP burst — breaking things is rewarded
    const kind = img.getData("kind");
    if (kind === "crate" || kind === "barrel") {
      this.boost.emitParticleAt(x, y - 10, 8);
      gameStore.addXp(2);
      this.audio.ding(1.2);
    }
    if (!gameStore.getState().reducedMotion) {
      this.scene.cameras.main.shake(120, Math.min(TUNING.camShakeCrash, 0.003 + impact * 0.0008));
    }
    img.setVisible(false);
    img.setActive(false);

    // Removing a Matter body synchronously from collisionstart can wedge Matter.
    this.scene.time.delayedCall(0, () => {
      if (!img.scene) return;
      const body = img.body as MatterJS.BodyType | undefined;
      if (body) this.scene.matter.world.remove(body);
      img.destroy();
    });
    return true;
  }

  bushRustle(x: number, y: number) {
    this.leaves.emitParticleAt(x, y, 10);
  }

  puddleSplash(x: number, y: number) {
    this.splash.emitParticleAt(x, y, 12);
  }

  boostBurst(x: number, y: number) {
    this.boost.emitParticleAt(x, y, 18);
  }

  thud(x: number, y: number, impact: number) {
    const pan = this.panAt(x);
    this.dust.emitParticleAt(x, y, Math.round(4 + Math.min(1, impact / 8) * 8));
    this.audio.crash(Math.min(0.6, impact / 8), pan);
    if (impact > 7) this.audio.boom(Math.min(1, (impact - 7) / 6), pan); // heavy wall slam
    if (!gameStore.getState().reducedMotion && impact > 2.2)
      this.scene.cameras.main.shake(80, TUNING.camShakeCrash * 0.4);
  }

  /** map a world-x to a stereo pan (-1..1) relative to the camera view */
  private panAt(x: number): number {
    const view = this.scene.cameras.main.worldView;
    if (!view.width) return 0;
    return Phaser.Math.Clamp((x - view.centerX) / (view.width / 2), -1, 1);
  }

  /** continuous drift dust at the rear wheels */
  driftPuff(x: number, y: number) {
    this.dust.emitParticleAt(x, y, 1);
  }

  private spawnDebris(x: number, y: number, rotation: number, force = 0.5) {
    const colors = [0xc79a5c, 0x8f6a38, 0xf2d199, 0x5a6170];
    const count = Math.round(7 + force * 6); // more shards from a harder smash
    for (let i = 0; i < count; i++) {
      const a = rotation + (i / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.25, 0.25);
      const speed = Phaser.Math.Between(70, 190) * (0.8 + force * 0.5);
      const shard = this.scene.add
        .rectangle(x, y, Phaser.Math.Between(6, 14), Phaser.Math.Between(4, 10), colors[i % colors.length], 0.95)
        .setStrokeStyle(1, 0x20242c, 0.35)
        .setRotation(a)
        .setDepth(99997);
      this.scene.tweens.add({
        targets: shard,
        x: x + Math.cos(a) * speed,
        y: y + Math.sin(a) * speed,
        rotation: a + Phaser.Math.FloatBetween(-4, 4),
        alpha: 0,
        duration: Phaser.Math.Between(420, 760),
        ease: "Cubic.out",
        onComplete: () => shard.destroy(),
      });
    }
  }
}
