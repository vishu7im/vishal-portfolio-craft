import Phaser from "phaser";
import { WORLD } from "../../world";
import { AmbientKit, INK } from "./AmbientKit";

/**
 * The world's punctual flourishes: continuous ambient particle emission (dust
 * behind the car, drifting leaves/petals) plus a timed roulette of one-off
 * spectacles — bird flocks, meteors, a helicopter, a hot-air balloon, lightning
 * and the cross-map train.
 */
export class WorldEvents {
  private readonly kit: AmbientKit;
  private nextBirdAt = 0;
  private nextEventAt = 8000;
  private trainActive = false;

  constructor(kit: AmbientKit) {
    this.kit = kit;
  }

  update(time: number) {
    this.emitAmbientParticles(time);

    if (time > this.nextBirdAt) {
      this.nextBirdAt = time + Phaser.Math.Between(13000, 24000);
      this.spawnBirds();
    }

    if (time > this.nextEventAt) {
      this.nextEventAt = time + Phaser.Math.Between(18000, 32000);
      this.spawnWorldEvent(time);
    }
  }

  private emitAmbientParticles(time: number) {
    const car = this.kit.car;
    if (Math.floor(time / 180) % 12 === 0) {
      this.kit.dust.emitParticleAt(
        car.x - Math.cos(car.angle) * 40 + Phaser.Math.Between(-25, 25),
        car.y - Math.sin(car.angle) * 40 + Phaser.Math.Between(-25, 25),
        car.speedNorm > 0.45 ? 1 : 0
      );
    }
    if (Math.random() < 0.01) {
      const area = WORLD.areas[Phaser.Math.Between(0, WORLD.areas.length - 1)];
      this.kit.leaves.emitParticleAt(
        area.center.x + Phaser.Math.Between(-area.footprint.w / 2, area.footprint.w / 2),
        area.center.y + Phaser.Math.Between(-area.footprint.h / 2, area.footprint.h / 2),
        1
      );
    }
    if (Math.random() < 0.006) {
      this.kit.petals.emitParticleAt(8100 + Phaser.Math.Between(-900, 900), 3700 + Phaser.Math.Between(-800, 800), 1);
    }
  }

  private spawnBirds() {
    const scene = this.kit.scene;
    const y = Phaser.Math.Between(650, 2500);
    const startX = Phaser.Math.Between(-200, 400);
    const flock = scene.add.container(startX, y).setDepth(99991);
    for (let i = 0; i < 9; i++) {
      const bird = scene.add.graphics();
      bird.lineStyle(2, INK, 0.75);
      bird.beginPath();
      bird.moveTo(-5, 0);
      bird.lineTo(0, -4);
      bird.lineTo(5, 0);
      bird.strokePath();
      bird.setPosition((i % 3) * 26, Math.floor(i / 3) * 16);
      flock.add(bird);
    }
    scene.tweens.add({
      targets: flock,
      x: WORLD.bounds.w + 300,
      y: y - Phaser.Math.Between(120, 420),
      duration: Phaser.Math.Between(9000, 13000),
      ease: "Sine.inOut",
      onComplete: () => flock.destroy(),
    });
  }

  private spawnWorldEvent(time: number) {
    const pick = Math.floor((time / 1000) % 5);
    if (pick === 0) return this.spawnMeteor();
    if (pick === 1) return this.spawnHelicopter();
    if (pick === 2) return this.spawnBalloon();
    if (pick === 3) return this.kit.spawnLightning();
    return this.spawnTrain();
  }

  private spawnMeteor() {
    const scene = this.kit.scene;
    const x = Phaser.Math.Between(1400, 8600);
    const y = Phaser.Math.Between(700, 2500);
    const meteor = scene.add.graphics().setDepth(99992);
    meteor.lineStyle(8, 0xf2b843, 0.9);
    meteor.beginPath();
    meteor.moveTo(-80, -45);
    meteor.lineTo(0, 0);
    meteor.strokePath();
    meteor.fillStyle(0xfff4d0, 1);
    meteor.fillCircle(0, 0, 10);
    meteor.setPosition(x - 500, y - 300);
    scene.tweens.add({
      targets: meteor,
      x,
      y,
      duration: 900,
      ease: "Cubic.in",
      onComplete: () => {
        this.kit.sparks.emitParticleAt(x, y, 26);
        meteor.destroy();
      },
    });
  }

  private spawnHelicopter() {
    const scene = this.kit.scene;
    const heli = scene.add.container(-240, Phaser.Math.Between(900, 5800)).setDepth(99993);
    heli.add(scene.add.rectangle(0, 0, 70, 24, 0x39414f, 0.95).setStrokeStyle(2, INK));
    heli.add(scene.add.rectangle(0, -22, 110, 4, 0x20242c, 0.8));
    heli.add(scene.add.rectangle(-50, 2, 40, 4, 0x20242c, 0.8));
    scene.tweens.add({
      targets: heli,
      x: WORLD.bounds.w + 260,
      duration: 14500,
      ease: "Linear",
      onUpdate: () => (heli.list[1] as Phaser.GameObjects.Rectangle).setRotation(scene.time.now * 0.05),
      onComplete: () => heli.destroy(),
    });
  }

  private spawnBalloon() {
    const scene = this.kit.scene;
    const balloon = scene.add.container(Phaser.Math.Between(800, 8600), WORLD.bounds.h + 240).setDepth(99989);
    balloon.add(scene.add.circle(0, -42, 42, 0xf0994b, 0.92).setStrokeStyle(2, INK));
    balloon.add(scene.add.rectangle(0, 18, 38, 30, 0xc08a55, 1).setStrokeStyle(2, INK));
    balloon.add(scene.add.line(0, 0, -22, -14, -14, 9, INK, 0.75));
    balloon.add(scene.add.line(0, 0, 22, -14, 14, 9, INK, 0.75));
    scene.tweens.add({
      targets: balloon,
      y: -300,
      x: balloon.x + Phaser.Math.Between(-500, 500),
      duration: 28000,
      ease: "Sine.inOut",
      onComplete: () => balloon.destroy(),
    });
  }

  private spawnTrain() {
    if (this.trainActive) return;
    const scene = this.kit.scene;
    this.trainActive = true;
    const train = scene.add.container(-520, 1375).setDepth(99988);
    for (let i = 0; i < 5; i++) {
      const car = scene.add.container(i * 118, 0);
      car.add(scene.add.rectangle(0, 0, 104, 54, i === 0 ? 0xe0663a : 0x39a0f0, 0.95).setStrokeStyle(2, INK));
      car.add(scene.add.rectangle(-24, 24, 18, 18, 0x20242c, 1));
      car.add(scene.add.rectangle(24, 24, 18, 18, 0x20242c, 1));
      train.add(car);
    }
    scene.tweens.add({
      targets: train,
      x: WORLD.bounds.w + 520,
      duration: 15000,
      ease: "Linear",
      onComplete: () => {
        train.destroy();
        this.trainActive = false;
      },
    });
  }
}
