import Phaser from "phaser";
import { WORLD } from "../world";
import { gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";
import type { DayNightSystem } from "./DayNightSystem";
import type { AudioSystem } from "./AudioSystem";

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

interface WalkerBot {
  node: Phaser.GameObjects.Container;
  reactAt: number;
}

interface RoadWalker extends WalkerBot {
  dist: number;
  dir: 1 | -1;
  lane: number;
  speed: number;
  phase: number;
  hitAt: number;
  disabledUntil: number;
}

const INK = 0x20242c;

type Weather = "clear" | "rain" | "storm";

/** props that get warm glows as night falls */
const NIGHT_GLOW_KINDS: Record<string, { tint: number; scale: number; max: number }> = {
  lamp: { tint: 0xffe9a8, scale: 0.7, max: 0.6 },
  house: { tint: 0xffe9a8, scale: 0.9, max: 0.5 },
  school: { tint: 0xffe9a8, scale: 1.1, max: 0.45 },
  office: { tint: 0xffe9a8, scale: 1.2, max: 0.55 },
  loft: { tint: 0xffd9a0, scale: 1.2, max: 0.55 },
  factory: { tint: 0xafd8ff, scale: 1.4, max: 0.5 },
  hq: { tint: 0xffe9a8, scale: 1.5, max: 0.6 },
  aiLab: { tint: 0x8c7cff, scale: 2.6, max: 0.9 }, // the neon lab owns the night
  cafe: { tint: 0xffc9a0, scale: 0.9, max: 0.6 },
  futureGate: { tint: 0xe04f3f, scale: 1.3, max: 0.55 },
};

export class AmbientWorldSystem {
  private readonly scene: Phaser.Scene;
  private readonly car: CarController;
  private readonly dayNight?: DayNightSystem;
  private readonly audio?: AudioSystem;
  private readonly props: ReactiveProp[] = [];
  private readonly serverDots: Phaser.GameObjects.GameObject[] = [];
  private readonly nightGlows: Array<{ img: Phaser.GameObjects.Image; max: number }> = [];
  private readonly drones: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; r: number; phase: number }> = [];
  private readonly butterflies: Array<{ node: Phaser.GameObjects.Container; cx: number; cy: number; phase: number }> = [];
  private readonly clouds: Phaser.GameObjects.Image[] = [];
  private readonly traffic: Array<{
    node: Phaser.GameObjects.Container;
    dist: number;
    dir: 1 | -1;
    speed: number;
  }> = [];
  private spinePoints: Array<{ x: number; y: number }> = [];
  private spineLens: number[] = [];
  private spineTotal = 0;
  // NPC reactions: walkers wave at a stopped car and jump at the horn
  private readonly walkerBots: WalkerBot[] = [];
  private readonly roadWalkers: RoadWalker[] = [];
  private readonly ducks: Array<{
    node: Phaser.GameObjects.Container;
    home: { x: number; y: number };
    fleeAt: number;
  }> = [];
  private readonly lampGlows = new Map<Phaser.GameObjects.Image, Phaser.GameObjects.Image>();
  private stillMs = 0;

  private readonly leaves: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly petals: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly dust: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly smoke: Phaser.GameObjects.Particles.ParticleEmitter;
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;

  private nextBirdAt = 0;
  private nextEventAt = 8000;
  private trainActive = false;
  private weather: Weather = "clear";
  private nextWeatherAt = 45000;

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

    this.collectExistingProps();
    this.addClouds();
    this.addDrones();
    this.addButterflies();
    this.addCoffeeRobot();
    this.addWalkers();
    this.addDucks();
    this.addTraffic();
    this.addRoadWalkers();
    this.buildRain();
    this.addAmbientDistrictDetails();
  }

  update(time: number, delta: number) {
    this.updateReactiveProps(time, delta);
    this.updateClouds(delta);
    this.updateDrones(time);
    this.updateButterflies(time);
    this.updateTraffic(delta);
    this.updateRoadWalkers(time, delta);
    this.updateNightGlows(time);
    this.updateWeather(time);
    this.emitAmbientParticles(time);
    this.updateNpcReactions(time, delta);
    this.updateDucks(time);

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
    this.ducks.forEach((d) => d.node.destroy());
    this.serverDots.forEach((o) => o.destroy());
    this.nightGlows.forEach((g) => g.img.destroy());
    this.drones.forEach((d) => d.node.destroy());
    this.butterflies.forEach((b) => b.node.destroy());
    this.clouds.forEach((c) => c.destroy());
    this.traffic.forEach((t) => t.node.destroy());
    this.roadWalkers.forEach((w) => w.node.destroy());
    this.leaves.destroy();
    this.petals.destroy();
    this.dust.destroy();
    this.sparks.destroy();
    this.smoke.destroy();
    this.rain?.destroy();
    this.headlights?.destroy();
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
        this.lampGlows.set(obj, glow);
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

      const nightSpec = NIGHT_GLOW_KINDS[kind];
      if (nightSpec) {
        const glow = this.scene.add
          .image(obj.x, obj.y - 14, "glow")
          .setTint(nightSpec.tint)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(nightSpec.scale * obj.scaleX * 2.2)
          .setAlpha(0)
          .setDepth(obj.depth + 1);
        this.nightGlows.push({ img: glow, max: nightSpec.max });
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
      { x: 900, y: 5450 },
      { x: 2150, y: 5450 },
      { x: 2100, y: 6550 },
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
      { x: 7600, y: 3350 },
      { x: 8950, y: 3850 },
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
    const bot = this.scene.add.container(7780, 1150).setDepth(10 + 1150 + 80);
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
      x: 8440,
      y: 1850,
      duration: 9500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
      onUpdate: () => bot.setDepth(10 + bot.y + 80),
    });
    this.serverDots.push(bot);
    this.walkerBots.push({ node: bot, reactAt: 0 });
  }

  /** two more walkers in the coffee-bot mould, in different districts */
  private addWalkers() {
    const walkers = [
      { from: { x: 4450, y: 3400 }, to: { x: 5150, y: 4000 }, label: "delivery bot", body: 0xcfe3bf, head: 0x4c9a6a },
      { from: { x: 4500, y: 5700 }, to: { x: 5100, y: 6300 }, label: "intern.exe", body: 0xdbe6ef, head: 0x39a0f0 },
    ];
    for (const w of walkers) {
      const bot = this.scene.add.container(w.from.x, w.from.y).setDepth(10 + w.from.y + 80);
      bot.add(this.scene.add.rectangle(0, 0, 36, 28, w.body, 1).setStrokeStyle(2, INK));
      bot.add(this.scene.add.circle(-9, -4, 3, INK, 1));
      bot.add(this.scene.add.circle(9, -4, 3, INK, 1));
      bot.add(this.scene.add.circle(0, -25, 10, w.head, 1).setStrokeStyle(2, INK));
      bot.add(
        this.scene.add
          .text(0, 30, w.label, { fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
          .setOrigin(0.5)
      );
      this.scene.tweens.add({
        targets: bot,
        x: w.to.x,
        y: w.to.y,
        duration: Phaser.Math.Between(8000, 11000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        onUpdate: () => bot.setDepth(10 + bot.y + 80),
      });
      this.serverDots.push(bot); // reuse the misc-cleanup bucket
      this.walkerBots.push({ node: bot, reactAt: 0 });
    }
  }

  /** ducks paddling near the forest pond and the Freelance Bay lagoon */
  private addDucks() {
    const spots = [
      { x: 1150, y: 1980 },
      { x: 1290, y: 2050 },
      { x: 1210, y: 1890 },
      { x: 8820, y: 4440 },
      { x: 8950, y: 4500 },
      { x: 9080, y: 4430 },
    ];
    for (const s of spots) {
      const duck = this.scene.add.container(s.x, s.y).setDepth(10 + s.y + 40);
      duck.add(this.scene.add.ellipse(0, 0, 18, 13, 0xf2e6cf).setStrokeStyle(2, INK));
      duck.add(this.scene.add.circle(7, -7, 5, 0xf2e6cf).setStrokeStyle(2, INK));
      duck.add(this.scene.add.triangle(15, -7, 0, -2, 7, 0, 0, 2, 0xf2b843));
      duck.setScale(Phaser.Math.FloatBetween(0.9, 1.15) * (Math.random() < 0.5 ? -1 : 1), 1);
      this.scene.tweens.add({
        targets: duck,
        y: s.y - 2.5,
        duration: Phaser.Math.Between(700, 1100),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.ducks.push({ node: duck, home: { x: s.x, y: s.y }, fleeAt: 0 });
    }
  }

  /** ducks waddle-scatter away from a close car (or the horn), then drift home */
  private updateDucks(time: number) {
    for (const d of this.ducks) {
      if (time < d.fleeAt) continue;
      const dx = d.node.x - this.car.x;
      const dy = d.node.y - this.car.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 150) {
        this.fleeDuck(d, time, dx / (dist || 1), dy / (dist || 1));
      } else if (dist > 320 && Math.hypot(d.node.x - d.home.x, d.node.y - d.home.y) > 24) {
        d.fleeAt = time + 4000;
        this.scene.tweens.add({
          targets: d.node,
          x: d.home.x,
          y: d.home.y,
          duration: 2600,
          ease: "Sine.inOut",
          onUpdate: () => d.node.setDepth(10 + d.node.y + 40),
        });
      }
    }
  }

  private fleeDuck(d: (typeof this.ducks)[number], time: number, nx: number, ny: number) {
    d.fleeAt = time + 2600;
    const jitter = Phaser.Math.FloatBetween(-0.5, 0.5);
    const fx = nx + jitter * -ny;
    const fy = ny + jitter * nx;
    this.audio?.chirp();
    this.scene.tweens.add({
      targets: d.node,
      x: d.node.x + fx * 130,
      y: d.node.y + fy * 130,
      duration: 750,
      ease: "Cubic.out",
      onUpdate: () => d.node.setDepth(10 + d.node.y + 40),
    });
  }

  /** floating reaction bubble above an NPC */
  private bubble(node: Phaser.GameObjects.Container, text: string) {
    const t = this.scene.add
      .text(node.x, node.y - 48, text, {
        fontFamily: "ui-monospace, monospace",
        fontSize: "18px",
        color: "#20242c",
        stroke: "#f4ede0",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(99995);
    this.scene.tweens.add({
      targets: t,
      y: t.y - 26,
      alpha: 0,
      duration: 1300,
      ease: "Cubic.out",
      onComplete: () => t.destroy(),
    });
  }

  /** the horn startles nearby walkers and ducks */
  onHorn(x: number, y: number) {
    const now = this.scene.time.now;
    for (const w of this.walkerBots) {
      if (now < w.reactAt) continue;
      if (Math.hypot(w.node.x - x, w.node.y - y) > 260) continue;
      w.reactAt = now + 4000;
      this.bubble(w.node, "!");
      this.scene.tweens.add({
        targets: w.node,
        scaleY: 1.18,
        duration: 130,
        yoyo: true,
        repeat: 1,
        ease: "Sine.inOut",
      });
    }
    for (const d of this.ducks) {
      if (now < d.fleeAt) continue;
      const dx = d.node.x - x;
      const dy = d.node.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist < 340) this.fleeDuck(d, now, dx / (dist || 1), dy / (dist || 1));
    }
  }

  /** walkers wave when the car sits still next to them for a beat */
  private updateNpcReactions(time: number, delta: number) {
    if (this.car.speedNorm < 0.05) this.stillMs += delta;
    else this.stillMs = 0;
    if (this.stillMs < 1000) return;
    for (const w of this.walkerBots) {
      if (time < w.reactAt) continue;
      if (Math.hypot(w.node.x - this.car.x, w.node.y - this.car.y) > 190) continue;
      w.reactAt = time + 9000;
      this.bubble(w.node, "👋");
    }
  }

  /** a hard hit makes a lamp lean, spark and flicker */
  onLampHit(img: Phaser.GameObjects.Image) {
    const base = this.props.find((p) => p.img === img)?.rotation ?? 0;
    this.sparks.emitParticleAt(img.x, img.y - 34, 6);
    this.scene.tweens.add({
      targets: img,
      rotation: base + (Math.random() < 0.5 ? -0.18 : 0.18),
      duration: 110,
      yoyo: true,
      ease: "Sine.out",
      onComplete: () => img.setRotation(base),
    });
    const glow = this.lampGlows.get(img);
    if (glow) {
      this.scene.tweens.add({
        targets: glow,
        alpha: 0.05,
        duration: 90,
        yoyo: true,
        repeat: 5,
      });
    }
  }

  /** ambient cars cruising the Career Road spine — pure decor, no physics */
  private addTraffic() {
    if (!this.ensureSpinePath()) return;
    const colors = [0x5aa0d8, 0xf2b843, 0xcfe3bf, 0xb06a4a];
    for (let i = 0; i < 4; i++) {
      const node = this.scene.add.container(0, 0).setDepth(50);
      node.add(this.scene.add.rectangle(0, 0, 40, 20, colors[i], 1).setStrokeStyle(2, INK));
      node.add(this.scene.add.rectangle(-4, 0, 14, 14, 0x20242c, 0.8));
      node.add(this.scene.add.circle(16, -7, 3, 0xfff4d0, 0.9));
      node.add(this.scene.add.circle(16, 7, 3, 0xfff4d0, 0.9));
      this.traffic.push({
        node,
        dist: (this.spineTotal / 4) * i,
        dir: i % 2 === 0 ? 1 : -1,
        speed: Phaser.Math.FloatBetween(0.12, 0.2),
      });
    }
  }

  private ensureSpinePath() {
    if (this.spinePoints.length) return true;
    const spine = WORLD.roads.find((r) => r.spine);
    if (!spine) return false;
    this.spinePoints = spine.points;
    this.spineLens = [];
    this.spineTotal = 0;
    for (let i = 0; i < spine.points.length - 1; i++) {
      const len = Math.hypot(
        spine.points[i + 1].x - spine.points[i].x,
        spine.points[i + 1].y - spine.points[i].y
      );
      this.spineLens.push(len);
      this.spineTotal += len;
    }
    return this.spineTotal > 0;
  }

  private addRoadWalkers() {
    if (!this.ensureSpinePath()) return;
    const colors = [
      { body: 0xf2e6cf, head: 0xc08a55, label: "npc" },
      { body: 0xdbe6ef, head: 0x39a0f0, label: "walker" },
      { body: 0xcfe3bf, head: 0x4c9a6a, label: "dev" },
      { body: 0xf7a6c8, head: 0xb06a4a, label: "guest" },
      { body: 0xffe9a8, head: 0xf0994b, label: "ops" },
      { body: 0xded6ff, head: 0x7b5cff, label: "qa" },
    ];
    const lanes = [-54, 0, 58, -18, 34, -72];
    for (let i = 0; i < colors.length; i++) {
      const point = this.pointOnSpine((this.spineTotal / colors.length) * (i + 0.35), 1, lanes[i]);
      const node = this.createRoadWalkerNode(point.x, point.y, colors[i].label, colors[i].body, colors[i].head);
      const walker: RoadWalker = {
        node,
        reactAt: 0,
        dist: (this.spineTotal / colors.length) * (i + 0.35),
        dir: i % 2 === 0 ? 1 : -1,
        lane: lanes[i],
        speed: Phaser.Math.FloatBetween(0.032, 0.058),
        phase: i * 1.7,
        hitAt: 0,
        disabledUntil: 0,
      };
      this.roadWalkers.push(walker);
      this.walkerBots.push(walker);
    }
  }

  private createRoadWalkerNode(x: number, y: number, label: string, body: number, head: number) {
    const node = this.scene.add.container(x, y).setDepth(10 + y + 70);
    node.add(this.scene.add.ellipse(0, 19, 31, 12, 0x151922, 0.18));
    node.add(this.scene.add.rectangle(-7, 11, 5, 17, 0x39414f, 1).setStrokeStyle(1, INK));
    node.add(this.scene.add.rectangle(7, 11, 5, 17, 0x39414f, 1).setStrokeStyle(1, INK));
    node.add(this.scene.add.rectangle(0, -4, 27, 31, body, 1).setStrokeStyle(2, INK));
    node.add(this.scene.add.circle(0, -27, 12, head, 1).setStrokeStyle(2, INK));
    node.add(this.scene.add.circle(-4, -30, 2.2, INK, 1));
    node.add(this.scene.add.circle(5, -30, 2.2, INK, 1));
    node.add(this.scene.add.rectangle(-19, -2, 5, 20, body, 1).setStrokeStyle(1, INK));
    node.add(this.scene.add.rectangle(19, -2, 5, 20, body, 1).setStrokeStyle(1, INK));
    node.add(
      this.scene.add
        .text(0, 34, label, {
          fontFamily: "ui-monospace, monospace",
          fontSize: "10px",
          color: "#20242c",
          stroke: "#f4ede0",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
    );
    return node;
  }

  private pointOnSpine(dist: number, dir: 1 | -1, lane: number) {
    if (!this.spinePoints.length) return { x: 0, y: 0, angle: 0 };
    let d = Phaser.Math.Clamp(dist, 0, this.spineTotal);
    let seg = 0;
    while (seg < this.spineLens.length - 1 && d > this.spineLens[seg]) {
      d -= this.spineLens[seg];
      seg++;
    }
    const a = this.spinePoints[seg];
    const b = this.spinePoints[seg + 1];
    const len = this.spineLens[seg] || 1;
    const k = Phaser.Math.Clamp(d / len, 0, 1);
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    return {
      x: a.x + ux * len * k - uy * lane,
      y: a.y + uy * len * k + ux * lane,
      angle: Math.atan2(uy * dir, ux * dir),
    };
  }

  private updateTraffic(delta: number) {
    if (!this.spinePoints.length) return;
    for (const t of this.traffic) {
      t.dist += t.speed * delta * t.dir;
      if (t.dist >= this.spineTotal) {
        t.dist = this.spineTotal;
        t.dir = -1;
      } else if (t.dist <= 0) {
        t.dist = 0;
        t.dir = 1;
      }
      // locate along the polyline, offset to the right lane
      let d = t.dist;
      let seg = 0;
      while (seg < this.spineLens.length - 1 && d > this.spineLens[seg]) {
        d -= this.spineLens[seg];
        seg++;
      }
      const a = this.spinePoints[seg];
      const b = this.spinePoints[seg + 1];
      const len = this.spineLens[seg] || 1;
      const k = Phaser.Math.Clamp(d / len, 0, 1);
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const lane = 52 * t.dir;
      const x = a.x + ux * len * k - uy * lane;
      const y = a.y + uy * len * k + ux * lane;
      t.node.setPosition(x, y);
      t.node.setRotation(Math.atan2(uy * t.dir, ux * t.dir));
      t.node.setDepth(10 + y - 30); // under the player car at same y
    }
  }

  private updateRoadWalkers(time: number, delta: number) {
    if (!this.spinePoints.length) return;
    const carVelocity = this.car.body.body.velocity;
    const carSpeed = Math.hypot(carVelocity.x, carVelocity.y);

    for (const w of this.roadWalkers) {
      if (time >= w.disabledUntil) {
        w.dist += w.speed * delta * w.dir;
        if (w.dist >= this.spineTotal) {
          w.dist = this.spineTotal;
          w.dir = -1;
        } else if (w.dist <= 0) {
          w.dist = 0;
          w.dir = 1;
        }
        const p = this.pointOnSpine(w.dist, w.dir, w.lane);
        const bob = Math.sin(time * 0.011 + w.phase);
        w.node.setPosition(p.x, p.y + bob * 2.5);
        w.node.setRotation(Math.sin(time * 0.006 + w.phase) * 0.035);
        w.node.setDepth(10 + w.node.y + 70);
      }

      if (time < w.hitAt || carSpeed < 1.2) continue;
      const dx = w.node.x - this.car.x;
      const dy = w.node.y - this.car.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 58) continue;
      this.hitRoadWalker(w, time, carSpeed, dx / (dist || 1), dy / (dist || 1));
    }
  }

  private hitRoadWalker(w: RoadWalker, time: number, carSpeed: number, nx: number, ny: number) {
    w.hitAt = time + 1800;
    w.disabledUntil = time + 920;
    w.reactAt = time + 3500;
    const shove = Phaser.Math.Clamp(90 + carSpeed * 18, 110, 230);
    this.audio?.crash(0.18 + Math.min(1, carSpeed / 8) * 0.22);
    this.dust.emitParticleAt(w.node.x, w.node.y + 16, 9);
    this.bubble(w.node, "bonk!");
    this.car.onCollision(Math.max(1.6, carSpeed), w.node.x, w.node.y);
    this.scene.tweens.killTweensOf(w.node);
    this.scene.tweens.add({
      targets: w.node,
      x: w.node.x + nx * shove,
      y: w.node.y + ny * shove,
      angle: Phaser.Math.FloatBetween(-0.34, 0.34),
      scaleX: 1.12,
      scaleY: 0.84,
      duration: 220,
      ease: "Cubic.out",
      yoyo: true,
      onUpdate: () => w.node.setDepth(10 + w.node.y + 70),
      onComplete: () => {
        w.node.setScale(1);
        w.node.setRotation(0);
      },
    });
  }

  private headlights?: Phaser.GameObjects.Image;

  private updateNightGlows(time: number) {
    const night = this.dayNight?.nightness ?? 0;
    if (night <= 0.01 && this.nightGlows[0]?.img.alpha === 0 && !this.headlights?.alpha) return;
    for (const g of this.nightGlows) {
      g.img.setAlpha(night * g.max * (0.9 + 0.1 * Math.sin(time * 0.004 + g.img.x)));
    }
    // headlight pool ahead of the car after dark
    if (!this.headlights) {
      this.headlights = this.scene.add
        .image(0, 0, "glow")
        .setTint(0xfff2c8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(2.6, 1.7)
        .setAlpha(0)
        .setDepth(9);
    }
    const a = this.car.angle;
    this.headlights
      .setPosition(this.car.x + Math.cos(a) * 120, this.car.y + Math.sin(a) * 120)
      .setRotation(a)
      .setAlpha(night * 0.55);
  }

  // --- weather ---------------------------------------------------------------

  private buildRain() {
    this.rain = this.scene.add
      .particles(0, 0, "soft", {
        tint: 0x9fc4e2,
        // generous fixed span — the emitter is repositioned to the view each
        // frame; extra margin keeps corners covered under the drift camera tilt
        x: { min: -600, max: 3400 },
        y: -30,
        lifespan: 900,
        speedY: { min: 640, max: 820 },
        speedX: { min: -60, max: -20 },
        scaleX: 0.06,
        scaleY: { start: 0.5, end: 0.3 },
        alpha: { start: 0.55, end: 0.1 },
        quantity: 3,
        emitting: false,
      })
      .setScrollFactor(0)
      .setDepth(95000);
  }

  private updateWeather(time: number) {
    if (time > this.nextWeatherAt) {
      const roll = Math.random();
      const next: Weather = roll < 0.68 ? "clear" : roll < 0.9 ? "rain" : "storm";
      this.setWeather(next);
      this.nextWeatherAt = time + Phaser.Math.Between(60000, 120000);
    }
    if (this.weather === "clear" || !this.rain) return;

    // keep the emitter pinned to the top-left of the visible view despite zoom
    const cam = this.scene.cameras.main;
    const z = cam.zoom;
    const left = (0 - cam.width / 2) / z + cam.width / 2;
    this.rain.setPosition(left, (0 - cam.height / 2) / z + cam.height / 2 - 40);

    // storms borrow the existing lightning event
    if (this.weather === "storm" && Math.random() < 0.004) this.spawnLightning();
    // wet roads: occasional puddle ripple near the car
    if (Math.random() < 0.05) this.spawnRipple(this.car.x + Phaser.Math.Between(-220, 220), this.car.y + Phaser.Math.Between(-160, 160), 0.8);
  }

  private setWeather(next: Weather) {
    if (next === this.weather) return;
    this.weather = next;
    const reduced = gameStore.getState().reducedMotion;
    if (next === "clear") {
      this.rain?.stop();
    } else {
      this.rain?.start();
      if (this.rain) this.rain.quantity = reduced ? 1 : next === "storm" ? 5 : 3;
    }
    this.audio?.setRain(next === "clear" ? 0 : next === "storm" ? 0.9 : 0.55);
  }

  private addAmbientDistrictDetails() {
    // Static visual identity accents: network cables, hologram rings, and achievement statues.
    const g = this.scene.add.graphics().setDepth(4);
    g.lineStyle(5, 0x39a0f0, 0.34);
    for (const y of [5480, 5600, 6525, 6645]) {
      g.beginPath();
      g.moveTo(3940, y);
      g.lineTo(5600, y - 80);
      g.strokePath();
    }
    g.lineStyle(4, 0x7b5cff, 0.32);
    for (const x of [900, 1500, 2100]) {
      g.strokeCircle(x, 6000, 190);
      g.strokeCircle(x, 6000, 230);
    }
    g.lineStyle(4, 0xf2b843, 0.28);
    g.beginPath();
    g.moveTo(7450, 5500);
    g.lineTo(8100, 6000);
    g.lineTo(8750, 5550);
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
      if (p.kind === "cafe" && Math.random() < 0.003) this.smoke.emitParticleAt(p.x, p.y - 58, 1);
      if (p.kind === "factory" && Math.random() < 0.002) this.smoke.emitParticleAt(p.x + 78, p.y - 92, 1);
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
      this.petals.emitParticleAt(8100 + Phaser.Math.Between(-900, 900), 3700 + Phaser.Math.Between(-800, 800), 1);
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
