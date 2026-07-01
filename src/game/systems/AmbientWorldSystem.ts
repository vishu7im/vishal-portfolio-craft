import Phaser from "phaser";
import { WORLD } from "../world";
import type { CarController } from "./CarController";

interface ReactiveProp {
  img: Phaser.GameObjects.Image;
  kind: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  cooldown: number;
}

const INK = 0x20242c;

export class AmbientWorldSystem {
  private readonly scene: Phaser.Scene;
  private readonly car: CarController;
  private readonly props: ReactiveProp[] = [];
  private readonly serverDots: Phaser.GameObjects.GameObject[] = [];
  private readonly drones: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; r: number; phase: number }> = [];
  private readonly butterflies: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; phase: number }> = [];
  private readonly clouds: Phaser.GameObjects.Image[] = [];

  private readonly leaves: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly petals: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly dust: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly smoke: Phaser.GameObjects.Particles.ParticleEmitter;

  private nextBirdAt = 0;
  private nextEventAt = 8000;
  private trainActive = false;

  constructor(scene: Phaser.Scene, car: CarController) {
    this.scene = scene;
    this.car = car;

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

    this.collectExistingProps();
    this.addClouds();
    this.addDrones();
    this.addButterflies();
    this.addCoffeeRobot();
    this.addAmbientDistrictDetails();
  }

  update(time: number, delta: number) {
    this.updateReactiveProps(time, delta);
    this.updateClouds(delta);
    this.updateDrones(time);
    this.updateButterflies(time);
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

  destroy() {
    this.serverDots.forEach((o) => o.destroy());
    this.drones.forEach((d) => d.node.destroy());
    this.butterflies.forEach((b) => b.node.destroy());
    this.clouds.forEach((c) => c.destroy());
    this.leaves.destroy();
    this.petals.destroy();
    this.dust.destroy();
    this.sparks.destroy();
    this.smoke.destroy();
  }

  private collectExistingProps() {
    for (const obj of this.scene.children.getAll()) {
      if (!(obj instanceof Phaser.GameObjects.Image) || !("getData" in obj)) continue;
      const kind = obj.getData("kind");
      if (!kind || kind === "car") continue;
      const prop: ReactiveProp = {
        img: obj,
        kind,
        x: obj.x,
        y: obj.y,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        rotation: obj.rotation,
        cooldown: 0,
      };
      this.props.push(prop);

      if (kind === "tree" || kind === "pine" || kind === "palm") {
        this.scene.tweens.add({
          targets: obj,
          rotation: obj.rotation + Phaser.Math.FloatBetween(-0.025, 0.025),
          duration: Phaser.Math.Between(2200, 4200),
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
          delay: Phaser.Math.Between(0, 1400),
        });
      }

      if (kind === "lamp") {
        const glow = this.scene.add
          .image(obj.x, obj.y - 28, "glow")
          .setTint(0xffe9a8)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(0.42)
          .setAlpha(0.2)
          .setDepth(obj.depth - 1);
        this.serverDots.push(glow);
        this.scene.tweens.add({
          targets: glow,
          alpha: 0.55,
          scale: 0.55,
          duration: Phaser.Math.Between(900, 1800),
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
        });
      }

      if (kind === "server") this.addServerBlinkers(obj);
      if (kind === "boost") {
        this.scene.tweens.add({
          targets: obj,
          alpha: 0.68,
          duration: 520,
          yoyo: true,
          repeat: -1,
          ease: "Sine.inOut",
        });
      }
    }
  }

  private addServerBlinkers(server: Phaser.GameObjects.Image) {
    for (let i = 0; i < 3; i++) {
      const dot = this.scene.add
        .circle(server.x - 13 + i * 12, server.y - 9 + i * 13, 3, i % 2 ? 0x4ce0a0 : 0x39a0f0, 0.7)
        .setDepth(server.depth + 2);
      this.serverDots.push(dot);
      this.scene.tweens.add({
        targets: dot,
        alpha: 0.12,
        duration: Phaser.Math.Between(360, 900),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 700),
      });
    }
  }

  private addClouds() {
    for (let i = 0; i < 8; i++) {
      const cloud = this.scene.add
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
    const centers = [
      { x: 7500, y: 3150 },
      { x: 8750, y: 3150 },
      { x: 8700, y: 4250 },
    ];
    centers.forEach((center, i) => {
      for (let n = 0; n < 2; n++) {
        const drone = this.scene.add.container(center.x, center.y).setDepth(10 + center.y + 120);
        drone.add(this.scene.add.rectangle(0, 0, 24, 14, 0x2a303b, 1).setStrokeStyle(1, INK));
        drone.add(this.scene.add.circle(-18, -2, 6, 0x7b5cff, 0.85));
        drone.add(this.scene.add.circle(18, -2, 6, 0x7b5cff, 0.85));
        drone.add(this.scene.add.image(0, 0, "glow").setTint(0x7b5cff).setBlendMode(Phaser.BlendModes.ADD).setScale(0.28));
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
    const centers = [
      { x: 1200, y: 1200 },
      { x: 2100, y: 1800 },
      { x: 4300, y: 3350 },
      { x: 5650, y: 3850 },
    ];
    centers.forEach((center, i) => {
      for (let n = 0; n < 4; n++) {
        const b = this.scene.add.container(center.x, center.y).setDepth(10 + center.y + 80);
        b.add(this.scene.add.circle(-4, 0, 4, 0xf7a6c8, 0.82));
        b.add(this.scene.add.circle(4, 0, 4, 0xf2b843, 0.82));
        b.add(this.scene.add.circle(0, 1, 2, INK, 0.7));
        this.butterflies.push({ node: b, cx: center.x, cy: center.y, phase: i * 2 + n * 0.7 });
      }
    });
  }

  private addCoffeeRobot() {
    const bot = this.scene.add.container(1180, 3350).setDepth(10 + 3350 + 80);
    bot.add(this.scene.add.rectangle(0, 0, 36, 28, 0xf2e6cf, 1).setStrokeStyle(2, INK));
    bot.add(this.scene.add.circle(-9, -4, 3, 0x20242c, 1));
    bot.add(this.scene.add.circle(9, -4, 3, 0x20242c, 1));
    bot.add(this.scene.add.circle(0, -25, 10, 0xc08a55, 1).setStrokeStyle(2, INK));
    bot.add(
      this.scene.add
        .text(0, 30, "coffee bot", { fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
        .setOrigin(0.5)
    );
    this.scene.tweens.add({
      targets: bot,
      x: 1840,
      y: 4050,
      duration: 9500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
      onUpdate: () => bot.setDepth(10 + bot.y + 80),
    });
  }

  private addAmbientDistrictDetails() {
    // Static visual identity accents: network cables, hologram rings, and achievement statues.
    const g = this.scene.add.graphics().setDepth(4);
    g.lineStyle(5, 0x39a0f0, 0.34);
    for (const y of [5480, 5600, 6525, 6645]) {
      g.beginPath();
      g.moveTo(7240, y);
      g.lineTo(8900, y - 80);
      g.strokePath();
    }
    g.lineStyle(4, 0x7b5cff, 0.32);
    for (const x of [7500, 8100, 8700]) {
      g.strokeCircle(x, 3700, 190);
      g.strokeCircle(x, 3700, 230);
    }
    g.lineStyle(4, 0xf2b843, 0.28);
    g.beginPath();
    g.moveTo(850, 5500);
    g.lineTo(1500, 6000);
    g.lineTo(2150, 5550);
    g.strokePath();
  }

  private updateReactiveProps(time: number, delta: number) {
    const carX = this.car.x;
    const carY = this.car.y;
    const speed = this.car.speedNorm;

    for (const p of this.props) {
      p.cooldown = Math.max(0, p.cooldown - delta);
      const d = Math.hypot(carX - p.x, carY - p.y);

      if (p.kind === "bush" && d < 95) {
        const push = 1 - d / 95;
        p.img.setScale(p.scaleX * (1 + push * 0.12), p.scaleY * (1 - push * 0.08));
        p.img.setRotation(p.rotation + Math.sin(time * 0.028 + p.x) * push * 0.18);
        if (p.cooldown <= 0 && speed > 0.12) {
          p.cooldown = 420;
          this.leaves.emitParticleAt(p.x, p.y, 5);
        }
      } else if (p.kind === "bush") {
        p.img.setScale(
          Phaser.Math.Linear(p.img.scaleX, p.scaleX, 0.08),
          Phaser.Math.Linear(p.img.scaleY, p.scaleY, 0.08)
        );
        p.img.setRotation(Phaser.Math.Angle.RotateTo(p.img.rotation, p.rotation, 0.025));
      }

      if ((p.kind === "tree" || p.kind === "pine" || p.kind === "palm") && d < 130 && speed > 0.18 && p.cooldown <= 0) {
        p.cooldown = 900;
        this.leaves.emitParticleAt(p.x, p.y - 40, p.kind === "palm" ? 4 : 8);
      }

      if (p.kind === "server" && Math.random() < 0.0009) this.sparks.emitParticleAt(p.x, p.y - 18, 2);
      if (p.kind === "silo" && Math.random() < 0.0016) this.smoke.emitParticleAt(p.x, p.y - 52, 1);
      if (p.kind === "puddle" && Math.random() < 0.002) this.spawnRipple(p.x, p.y, p.scaleX);
    }
  }

  private updateClouds(delta: number) {
    for (const cloud of this.clouds) {
      cloud.x += Number(cloud.getData("speed")) * delta;
      cloud.y += Math.sin(this.scene.time.now * 0.0002 + cloud.x * 0.001) * 0.012 * delta;
      if (cloud.x > WORLD.bounds.w + 500) cloud.x = -500;
    }
  }

  private updateDrones(time: number) {
    for (const d of this.drones) {
      const a = time * 0.0009 + d.phase;
      d.node.setPosition(d.cx + Math.cos(a) * d.r, d.cy + Math.sin(a * 1.35) * d.r * 0.45 - 82);
      d.node.setRotation(Math.sin(a * 2) * 0.12);
      d.node.setDepth(10 + d.node.y + 160);
      if (Math.random() < 0.01) this.sparks.emitParticleAt(d.node.x, d.node.y, 1);
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

  private emitAmbientParticles(time: number) {
    if (Math.floor(time / 180) % 12 === 0) {
      this.dust.emitParticleAt(
        this.car.x - Math.cos(this.car.angle) * 40 + Phaser.Math.Between(-25, 25),
        this.car.y - Math.sin(this.car.angle) * 40 + Phaser.Math.Between(-25, 25),
        this.car.speedNorm > 0.45 ? 1 : 0
      );
    }
    if (Math.random() < 0.01) {
      const area = WORLD.areas[Phaser.Math.Between(0, WORLD.areas.length - 1)];
      this.leaves.emitParticleAt(
        area.center.x + Phaser.Math.Between(-area.footprint.w / 2, area.footprint.w / 2),
        area.center.y + Phaser.Math.Between(-area.footprint.h / 2, area.footprint.h / 2),
        1
      );
    }
    if (Math.random() < 0.006) {
      this.petals.emitParticleAt(4800 + Phaser.Math.Between(-900, 900), 3700 + Phaser.Math.Between(-800, 800), 1);
    }
  }

  private spawnRipple(x: number, y: number, scale: number) {
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

  private spawnBirds() {
    const y = Phaser.Math.Between(650, 2500);
    const startX = Phaser.Math.Between(-200, 400);
    const flock = this.scene.add.container(startX, y).setDepth(99991);
    for (let i = 0; i < 9; i++) {
      const bird = this.scene.add.graphics();
      bird.lineStyle(2, INK, 0.75);
      bird.beginPath();
      bird.moveTo(-5, 0);
      bird.lineTo(0, -4);
      bird.lineTo(5, 0);
      bird.strokePath();
      bird.setPosition((i % 3) * 26, Math.floor(i / 3) * 16);
      flock.add(bird);
    }
    this.scene.tweens.add({
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
    if (pick === 3) return this.spawnLightning();
    return this.spawnTrain();
  }

  private spawnMeteor() {
    const x = Phaser.Math.Between(1400, 8600);
    const y = Phaser.Math.Between(700, 2500);
    const meteor = this.scene.add.graphics().setDepth(99992);
    meteor.lineStyle(8, 0xf2b843, 0.9);
    meteor.beginPath();
    meteor.moveTo(-80, -45);
    meteor.lineTo(0, 0);
    meteor.strokePath();
    meteor.fillStyle(0xfff4d0, 1);
    meteor.fillCircle(0, 0, 10);
    meteor.setPosition(x - 500, y - 300);
    this.scene.tweens.add({
      targets: meteor,
      x,
      y,
      duration: 900,
      ease: "Cubic.in",
      onComplete: () => {
        this.sparks.emitParticleAt(x, y, 26);
        meteor.destroy();
      },
    });
  }

  private spawnHelicopter() {
    const heli = this.scene.add.container(-240, Phaser.Math.Between(900, 5800)).setDepth(99993);
    heli.add(this.scene.add.rectangle(0, 0, 70, 24, 0x39414f, 0.95).setStrokeStyle(2, INK));
    heli.add(this.scene.add.rectangle(0, -22, 110, 4, 0x20242c, 0.8));
    heli.add(this.scene.add.rectangle(-50, 2, 40, 4, 0x20242c, 0.8));
    this.scene.tweens.add({
      targets: heli,
      x: WORLD.bounds.w + 260,
      duration: 14500,
      ease: "Linear",
      onUpdate: () => (heli.list[1] as Phaser.GameObjects.Rectangle).setRotation(this.scene.time.now * 0.05),
      onComplete: () => heli.destroy(),
    });
  }

  private spawnBalloon() {
    const balloon = this.scene.add.container(Phaser.Math.Between(800, 8600), WORLD.bounds.h + 240).setDepth(99989);
    balloon.add(this.scene.add.circle(0, -42, 42, 0xf0994b, 0.92).setStrokeStyle(2, INK));
    balloon.add(this.scene.add.rectangle(0, 18, 38, 30, 0xc08a55, 1).setStrokeStyle(2, INK));
    balloon.add(this.scene.add.line(0, 0, -22, -14, -14, 9, INK, 0.75));
    balloon.add(this.scene.add.line(0, 0, 22, -14, 14, 9, INK, 0.75));
    this.scene.tweens.add({
      targets: balloon,
      y: -300,
      x: balloon.x + Phaser.Math.Between(-500, 500),
      duration: 28000,
      ease: "Sine.inOut",
      onComplete: () => balloon.destroy(),
    });
  }

  private spawnLightning() {
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

  private spawnTrain() {
    if (this.trainActive) return;
    this.trainActive = true;
    const train = this.scene.add.container(-520, 1375).setDepth(99988);
    for (let i = 0; i < 5; i++) {
      const car = this.scene.add.container(i * 118, 0);
      car.add(this.scene.add.rectangle(0, 0, 104, 54, i === 0 ? 0xe0663a : 0x39a0f0, 0.95).setStrokeStyle(2, INK));
      car.add(this.scene.add.rectangle(-24, 24, 18, 18, 0x20242c, 1));
      car.add(this.scene.add.rectangle(24, 24, 18, 18, 0x20242c, 1));
      train.add(car);
    }
    this.scene.tweens.add({
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
