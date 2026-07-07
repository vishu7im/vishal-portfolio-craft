import Phaser from "phaser";
import { WORLD } from "../../world";
import { AmbientKit, INK } from "./AmbientKit";

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

interface Duck {
  node: Phaser.GameObjects.Container;
  home: { x: number; y: number };
  fleeAt: number;
}

/**
 * All the little characters: wandering bots (coffee/delivery/intern), the road
 * walkers strolling the Career Road spine, ambient decor traffic, and the pond
 * ducks. Handles their motion plus reactions to the car — waves when you idle
 * beside them, scatters at the horn, and bonks when you clip a road walker.
 */
export class Npcs {
  private readonly kit: AmbientKit;
  private readonly walkerBots: WalkerBot[] = [];
  private readonly roadWalkers: RoadWalker[] = [];
  private readonly ducks: Duck[] = [];
  private readonly traffic: Array<{
    node: Phaser.GameObjects.Container;
    dist: number;
    dir: 1 | -1;
    speed: number;
  }> = [];
  private spinePoints: Array<{ x: number; y: number }> = [];
  private spineLens: number[] = [];
  private spineTotal = 0;
  private stillMs = 0;

  constructor(kit: AmbientKit) {
    this.kit = kit;
    this.addCoffeeRobot();
    this.addWalkers();
    this.addDucks();
    this.addTraffic();
    this.addRoadWalkers();
  }

  update(time: number, delta: number) {
    this.updateTraffic(delta);
    this.updateRoadWalkers(time, delta);
    this.updateNpcReactions(time, delta);
    this.updateDucks(time);
  }

  destroy() {
    this.ducks.forEach((d) => d.node.destroy());
    this.traffic.forEach((t) => t.node.destroy());
    this.roadWalkers.forEach((w) => w.node.destroy());
    // coffee robot + walkers are tween-driven; destroyed with the scene
  }

  private addCoffeeRobot() {
    const scene = this.kit.scene;
    const bot = scene.add.container(7780, 1150).setDepth(10 + 1150 + 80);
    bot.add(scene.add.rectangle(0, 0, 36, 28, 0xf2e6cf, 1).setStrokeStyle(2, INK));
    bot.add(scene.add.circle(-9, -4, 3, 0x20242c, 1));
    bot.add(scene.add.circle(9, -4, 3, 0x20242c, 1));
    bot.add(scene.add.circle(0, -25, 10, 0xc08a55, 1).setStrokeStyle(2, INK));
    bot.add(
      scene.add
        .text(0, 30, "coffee bot", { fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
        .setOrigin(0.5)
    );
    scene.tweens.add({
      targets: bot,
      x: 8440,
      y: 1850,
      duration: 9500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
      onUpdate: () => bot.setDepth(10 + bot.y + 80),
    });
    this.walkerBots.push({ node: bot, reactAt: 0 });
  }

  /** two more walkers in the coffee-bot mould, in different districts */
  private addWalkers() {
    const scene = this.kit.scene;
    const walkers = [
      { from: { x: 4450, y: 3400 }, to: { x: 5150, y: 4000 }, label: "delivery bot", body: 0xcfe3bf, head: 0x4c9a6a },
      { from: { x: 4500, y: 5700 }, to: { x: 5100, y: 6300 }, label: "intern.exe", body: 0xdbe6ef, head: 0x39a0f0 },
    ];
    for (const w of walkers) {
      const bot = scene.add.container(w.from.x, w.from.y).setDepth(10 + w.from.y + 80);
      bot.add(scene.add.rectangle(0, 0, 36, 28, w.body, 1).setStrokeStyle(2, INK));
      bot.add(scene.add.circle(-9, -4, 3, INK, 1));
      bot.add(scene.add.circle(9, -4, 3, INK, 1));
      bot.add(scene.add.circle(0, -25, 10, w.head, 1).setStrokeStyle(2, INK));
      bot.add(
        scene.add
          .text(0, 30, w.label, { fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
          .setOrigin(0.5)
      );
      scene.tweens.add({
        targets: bot,
        x: w.to.x,
        y: w.to.y,
        duration: Phaser.Math.Between(8000, 11000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
        onUpdate: () => bot.setDepth(10 + bot.y + 80),
      });
      this.walkerBots.push({ node: bot, reactAt: 0 });
    }
  }

  /** ducks paddling near the forest pond and the Freelance Bay lagoon */
  private addDucks() {
    const scene = this.kit.scene;
    const spots = [
      { x: 1150, y: 1980 },
      { x: 1290, y: 2050 },
      { x: 1210, y: 1890 },
      { x: 8820, y: 4440 },
      { x: 8950, y: 4500 },
      { x: 9080, y: 4430 },
    ];
    for (const s of spots) {
      const duck = scene.add.container(s.x, s.y).setDepth(10 + s.y + 40);
      duck.add(scene.add.ellipse(0, 0, 18, 13, 0xf2e6cf).setStrokeStyle(2, INK));
      duck.add(scene.add.circle(7, -7, 5, 0xf2e6cf).setStrokeStyle(2, INK));
      duck.add(scene.add.triangle(15, -7, 0, -2, 7, 0, 0, 2, 0xf2b843));
      duck.setScale(Phaser.Math.FloatBetween(0.9, 1.15) * (Math.random() < 0.5 ? -1 : 1), 1);
      scene.tweens.add({
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
    const car = this.kit.car;
    for (const d of this.ducks) {
      if (time < d.fleeAt) continue;
      const dx = d.node.x - car.x;
      const dy = d.node.y - car.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 150) {
        this.fleeDuck(d, time, dx / (dist || 1), dy / (dist || 1));
      } else if (dist > 320 && Math.hypot(d.node.x - d.home.x, d.node.y - d.home.y) > 24) {
        d.fleeAt = time + 4000;
        this.kit.scene.tweens.add({
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

  private fleeDuck(d: Duck, time: number, nx: number, ny: number) {
    d.fleeAt = time + 2600;
    const jitter = Phaser.Math.FloatBetween(-0.5, 0.5);
    const fx = nx + jitter * -ny;
    const fy = ny + jitter * nx;
    this.kit.audio?.chirp();
    this.kit.scene.tweens.add({
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
    const scene = this.kit.scene;
    const t = scene.add
      .text(node.x, node.y - 48, text, {
        fontFamily: "ui-monospace, monospace",
        fontSize: "18px",
        color: "#20242c",
        stroke: "#f4ede0",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(99995);
    scene.tweens.add({
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
    const scene = this.kit.scene;
    const now = scene.time.now;
    for (const w of this.walkerBots) {
      if (now < w.reactAt) continue;
      if (Math.hypot(w.node.x - x, w.node.y - y) > 260) continue;
      w.reactAt = now + 4000;
      this.bubble(w.node, "!");
      scene.tweens.add({
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
    const car = this.kit.car;
    if (car.speedNorm < 0.05) this.stillMs += delta;
    else this.stillMs = 0;
    if (this.stillMs < 1000) return;
    for (const w of this.walkerBots) {
      if (time < w.reactAt) continue;
      if (Math.hypot(w.node.x - car.x, w.node.y - car.y) > 190) continue;
      w.reactAt = time + 9000;
      this.bubble(w.node, "👋");
    }
  }

  /** ambient cars cruising the Career Road spine — pure decor, no physics */
  private addTraffic() {
    if (!this.ensureSpinePath()) return;
    const scene = this.kit.scene;
    const colors = [0x5aa0d8, 0xf2b843, 0xcfe3bf, 0xb06a4a];
    for (let i = 0; i < 4; i++) {
      const node = scene.add.container(0, 0).setDepth(50);
      node.add(scene.add.rectangle(0, 0, 40, 20, colors[i], 1).setStrokeStyle(2, INK));
      node.add(scene.add.rectangle(-4, 0, 14, 14, 0x20242c, 0.8));
      node.add(scene.add.circle(16, -7, 3, 0xfff4d0, 0.9));
      node.add(scene.add.circle(16, 7, 3, 0xfff4d0, 0.9));
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
    const scene = this.kit.scene;
    const node = scene.add.container(x, y).setDepth(10 + y + 70);
    node.add(scene.add.ellipse(0, 19, 31, 12, 0x151922, 0.18));
    node.add(scene.add.rectangle(-7, 11, 5, 17, 0x39414f, 1).setStrokeStyle(1, INK));
    node.add(scene.add.rectangle(7, 11, 5, 17, 0x39414f, 1).setStrokeStyle(1, INK));
    node.add(scene.add.rectangle(0, -4, 27, 31, body, 1).setStrokeStyle(2, INK));
    node.add(scene.add.circle(0, -27, 12, head, 1).setStrokeStyle(2, INK));
    node.add(scene.add.circle(-4, -30, 2.2, INK, 1));
    node.add(scene.add.circle(5, -30, 2.2, INK, 1));
    node.add(scene.add.rectangle(-19, -2, 5, 20, body, 1).setStrokeStyle(1, INK));
    node.add(scene.add.rectangle(19, -2, 5, 20, body, 1).setStrokeStyle(1, INK));
    node.add(
      scene.add
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
    const car = this.kit.car;
    const carVelocity = car.body.body.velocity;
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
      const dx = w.node.x - car.x;
      const dy = w.node.y - car.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 58) continue;
      this.hitRoadWalker(w, time, carSpeed, dx / (dist || 1), dy / (dist || 1));
    }
  }

  private hitRoadWalker(w: RoadWalker, time: number, carSpeed: number, nx: number, ny: number) {
    const scene = this.kit.scene;
    const car = this.kit.car;
    w.hitAt = time + 1800;
    w.disabledUntil = time + 920;
    w.reactAt = time + 3500;
    const shove = Phaser.Math.Clamp(90 + carSpeed * 18, 110, 230);
    this.kit.audio?.crash(0.18 + Math.min(1, carSpeed / 8) * 0.22);
    this.kit.dust.emitParticleAt(w.node.x, w.node.y + 16, 9);
    this.bubble(w.node, "bonk!");
    car.onCollision(Math.max(1.6, carSpeed), w.node.x, w.node.y);
    scene.tweens.killTweensOf(w.node);
    scene.tweens.add({
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
}
