import Phaser from "phaser";
import { WORLD } from "../../world";
import { AmbientKit, INK } from "./AmbientKit";

/** Purely decorative background motion: drifting clouds, patrolling drones, and
 *  fluttering butterflies. No interaction with the car. */
export class AmbientLife {
  private readonly kit: AmbientKit;
  private readonly clouds: Phaser.GameObjects.Image[] = [];
  private readonly drones: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; r: number; phase: number }> = [];
  private readonly butterflies: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; phase: number }> = [];

  constructor(kit: AmbientKit) {
    this.kit = kit;
    this.addClouds();
    this.addDrones();
    this.addButterflies();
  }

  update(time: number, delta: number) {
    this.updateClouds(delta);
    this.updateDrones(time);
    this.updateButterflies(time);
  }

  destroy() {
    this.drones.forEach((d) => d.node.destroy());
    this.butterflies.forEach((b) => b.node.destroy());
    this.clouds.forEach((c) => c.destroy());
  }

  private addClouds() {
    const scene = this.kit.scene;
    for (let i = 0; i < 8; i++) {
      const cloud = scene.add
        .image(Phaser.Math.Between(200, WORLD.bounds.w - 200), Phaser.Math.Between(260, WORLD.bounds.h - 260), "soft")
        .setTint(0xffffff)
        .setAlpha(0.12)
        .setScale(Phaser.Math.FloatBetween(5, 9), Phaser.Math.FloatBetween(2.2, 4.2))
        .setDepth(6);
      cloud.setData("speed", Phaser.Math.FloatBetween(0.008, 0.022));
      this.clouds.push(cloud);
    }
  }

  private addDrones() {
    const scene = this.kit.scene;
    const centers = [
      { x: 900, y: 5450 },
      { x: 2150, y: 5450 },
      { x: 2100, y: 6550 },
    ];
    centers.forEach((center, i) => {
      for (let n = 0; n < 2; n++) {
        const drone = scene.add.container(center.x, center.y).setDepth(10 + center.y + 120);
        drone.add(scene.add.rectangle(0, 0, 24, 14, 0x2a303b, 1).setStrokeStyle(1, INK));
        drone.add(scene.add.circle(-18, -2, 6, 0x7b5cff, 0.85));
        drone.add(scene.add.circle(18, -2, 6, 0x7b5cff, 0.85));
        drone.add(scene.add.image(0, 0, "glow").setTint(0x7b5cff).setBlendMode(Phaser.BlendModes.ADD).setScale(0.28));
        this.drones.push({
          node: drone,
          cx: center.x,
          cy: center.y,
          r: 105 + n * 50,
          phase: i * 1.7 + n * Math.PI,
        });
      }
    });
  }

  private addButterflies() {
    const scene = this.kit.scene;
    const centers = [
      { x: 1200, y: 1200 },
      { x: 2100, y: 1800 },
      { x: 7600, y: 3350 },
      { x: 8950, y: 3850 },
    ];
    centers.forEach((center, i) => {
      for (let n = 0; n < 4; n++) {
        const b = scene.add.container(center.x, center.y).setDepth(10 + center.y + 80);
        b.add(scene.add.circle(-4, 0, 4, 0xf7a6c8, 0.82));
        b.add(scene.add.circle(4, 0, 4, 0xf2b843, 0.82));
        b.add(scene.add.circle(0, 1, 2, INK, 0.7));
        this.butterflies.push({ node: b, cx: center.x, cy: center.y, phase: i * 2 + n * 0.7 });
      }
    });
  }

  private updateClouds(delta: number) {
    const now = this.kit.scene.time.now;
    for (const cloud of this.clouds) {
      cloud.x += Number(cloud.getData("speed")) * delta;
      cloud.y += Math.sin(now * 0.0002 + cloud.x * 0.001) * 0.012 * delta;
      if (cloud.x > WORLD.bounds.w + 500) cloud.x = -500;
    }
  }

  private updateDrones(time: number) {
    for (const d of this.drones) {
      const a = time * 0.0009 + d.phase;
      d.node.setPosition(d.cx + Math.cos(a) * d.r, d.cy + Math.sin(a * 1.35) * d.r * 0.45 - 82);
      d.node.setRotation(Math.sin(a * 2) * 0.12);
      d.node.setDepth(10 + d.node.y + 160);
      if (Math.random() < 0.01) this.kit.sparks.emitParticleAt(d.node.x, d.node.y, 1);
    }
  }

  private updateButterflies(time: number) {
    for (const b of this.butterflies) {
      const a = time * 0.0012 + b.phase;
      b.node.setPosition(b.cx + Math.cos(a) * 70 + Math.sin(a * 2.1) * 24, b.cy + Math.sin(a * 1.4) * 42);
      b.node.setScale(0.8 + Math.sin(time * 0.02 + b.phase) * 0.18);
      b.node.setAlpha(0.45 + Math.sin(time * 0.003 + b.phase) * 0.25);
    }
  }
}
