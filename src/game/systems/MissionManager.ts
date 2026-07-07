import Phaser from "phaser";
import toast from "react-hot-toast";
import type { MissionDef } from "../types";
import { WORLD } from "../world";
import { gameStore } from "../state/gameStore";
import { TEX_SS } from "../art/textureFactory";
import type { CarController } from "./CarController";
import type { AudioSystem } from "./AudioSystem";
import type { CameraRig } from "./CameraRig";

// Runs all missions: delivery (carry a package to a drop), race (hit checkpoints
// before the clock), escape (outrun the memory-leak monster), and the boss
// production incident (hit fix stations before CPU maxes out). Missions start by
// driving into their beacon. Only one runs at a time.

interface Beacon {
  mission: MissionDef;
  glow: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
}

export class MissionManager {
  private scene: Phaser.Scene;
  private car: CarController;
  private audio: AudioSystem;
  private rig?: CameraRig;
  private beacons = new Map<string, Beacon>();

  private active: MissionDef | null = null;
  private pkg?: Phaser.GameObjects.Image;
  private markers: Phaser.GameObjects.Image[] = [];
  private chaser?: Phaser.GameObjects.Container;
  private chasers: Phaser.GameObjects.Container[] = [];
  private fireworks: Phaser.GameObjects.Particles.ParticleEmitter;
  private cpIndex = 0;
  private timer = 0;
  private cpu = 0; // boss CPU meter 0..1
  private cpuBar?: Phaser.GameObjects.Graphics;
  private redPulse?: Phaser.GameObjects.Rectangle;
  private lastObjective = "";

  get isActive() {
    return this.active !== null;
  }

  setCameraRig(rig: CameraRig) {
    this.rig = rig;
  }

  constructor(scene: Phaser.Scene, car: CarController, audio: AudioSystem) {
    this.scene = scene;
    this.car = car;
    this.audio = audio;
    this.fireworks = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x4ce0a0, 0xf2b843, 0xf0813a, 0x7b5cff],
        speed: { min: 110, max: 320 },
        scale: { start: 0.9, end: 0 },
        lifespan: 900,
        gravityY: 80,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);
    for (const m of WORLD.missions) {
      if (!gameStore.getState().missionsDone.includes(m.id)) this.addBeacon(m);
    }
  }

  private addBeacon(m: MissionDef) {
    const glow = this.scene.add
      .image(m.giver.x, m.giver.y, "glow")
      .setTint(0xffcf5a)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.6)
      .setDepth(10 + m.giver.y - 5);
    this.scene.tweens.add({ targets: glow, scale: 2.1, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
    const label = this.scene.add
      .text(m.giver.x, m.giver.y - 46, "!  MISSION", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "13px",
        color: "#7a5a10",
        backgroundColor: "rgba(255,207,90,0.9)",
      })
      .setOrigin(0.5)
      .setPadding(6, 3, 6, 3)
      .setDepth(99997);
    this.scene.tweens.add({ targets: label, y: m.giver.y - 54, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    this.beacons.set(m.id, { mission: m, glow, label });
  }

  private removeBeacon(id: string) {
    const b = this.beacons.get(id);
    if (b) {
      b.glow.destroy();
      b.label.destroy();
      this.beacons.delete(id);
    }
  }

  private ring(x: number, y: number, tint: number) {
    const img = this.scene.add
      .image(x, y, "glow")
      .setTint(tint)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(2)
      .setDepth(10 + y - 5);
    this.scene.tweens.add({ targets: img, scale: 2.6, alpha: 0.6, duration: 700, yoyo: true, repeat: -1 });
    this.markers.push(img);
    return img;
  }

  private setObjective(text: string) {
    if (text !== this.lastObjective) {
      this.lastObjective = text;
      gameStore.setObjective(text);
    }
  }

  private cleanup() {
    this.pkg?.destroy();
    this.pkg = undefined;
    this.markers.forEach((m) => m.destroy());
    this.markers = [];
    this.chaser?.destroy();
    this.chaser = undefined;
    this.chasers.forEach((c) => c.destroy());
    this.chasers = [];
    this.cpuBar?.destroy();
    this.cpuBar = undefined;
    this.redPulse?.destroy();
    this.redPulse = undefined;
    this.rig?.zoomTo(null);
  }

  private start(m: MissionDef) {
    this.startCore(m);
  }

  private startCore(m: MissionDef) {
    this.active = m;
    this.removeBeacon(m.id);
    gameStore.startMission(m.id, m.title);
    this.lastObjective = m.title;
    this.audio.ding(0.9);
    toast(`🎯 ${m.title}: ${m.brief}`);

    if (m.type === "boss" && m.stations) {
      this.cpIndex = 0;
      this.cpu = 0.85;
      this.timer = m.cpuRampMs ?? 25000;
      m.stations.forEach((s) => this.ring(s.x, s.y, 0xe04f3f));
      this.markers.forEach((mk, i) => mk.setAlpha(i === 0 ? 1 : 0.25));
      this.spawnRequestBlobs(m);
      this.buildBossOverlay();
      this.rig?.zoomTo(1.22);
      this.rig?.shake(0.004, 500);
      this.audio.alarm();
      toast("🔥 TRAFFIC SPIKE — CPU 95%", { duration: 3200 });
      return;
    }

    if (m.type === "delivery" && m.deliver) {
      this.pkg = this.scene.add.image(this.car.x, this.car.y, "prop-crate").setScale(0.7 / TEX_SS);
      this.ring(m.deliver.x, m.deliver.y, 0x4ce0a0);
      this.setObjective(m.deliver.label);
    } else if (m.type === "race" && m.checkpoints) {
      this.cpIndex = 0;
      this.timer = m.timeLimitMs ?? 20000;
      m.checkpoints.forEach((c) => this.ring(c.x, c.y, 0x39a0f0));
      this.markers.forEach((mk, i) => mk.setAlpha(i === 0 ? 1 : 0.25));
    } else if (m.type === "escape") {
      this.timer = m.surviveMs ?? 20000;
      const a = this.car.angle;
      const cx = this.car.x - Math.cos(a) * 420;
      const cy = this.car.y - Math.sin(a) * 420;
      const glow = this.scene.add.image(0, 0, "glow").setTint(0xff3b30).setBlendMode(Phaser.BlendModes.ADD).setScale(2.6);
      const core = this.scene.add.image(0, 0, "soft").setTint(0x7a1410).setScale(2.2);
      const tag = this.scene.add
        .text(0, -44, "🐛 MEMORY LEAK", { fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "#ffd7d3", backgroundColor: "rgba(122,20,16,0.85)" })
        .setOrigin(0.5)
        .setPadding(5, 2, 5, 2);
      this.chaser = this.scene.add.container(cx, cy, [glow, core, tag]).setDepth(99996);
      this.scene.tweens.add({ targets: glow, scale: 3.1, duration: 500, yoyo: true, repeat: -1 });
    }
  }

  /** boss: slow "request" blobs that chase the car and add CPU load on touch */
  private spawnRequestBlobs(m: MissionDef) {
    const labels = ["GET /orders", "POST /checkout", "GET /search"];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const glow = this.scene.add.image(0, 0, "glow").setTint(0xf0813a).setBlendMode(Phaser.BlendModes.ADD).setScale(1.7);
      const core = this.scene.add.image(0, 0, "soft").setTint(0xa14b12).setScale(1.4);
      const tag = this.scene.add
        .text(0, -36, labels[i], { fontFamily: "ui-monospace, monospace", fontSize: "10px", color: "#ffe3c9", backgroundColor: "rgba(161,75,18,0.85)" })
        .setOrigin(0.5)
        .setPadding(4, 2, 4, 2);
      const blob = this.scene.add
        .container(m.giver.x + Math.cos(a) * 460, m.giver.y + Math.sin(a) * 460, [glow, core, tag])
        .setDepth(99995);
      this.chasers.push(blob);
    }
  }

  /** screen-fixed CPU meter + red edge pulse for the boss fight */
  private buildBossOverlay() {
    this.cpuBar = this.scene.add.graphics().setScrollFactor(0).setDepth(99998);
    this.redPulse = this.scene.add
      .rectangle(0, 0, 4, 4, 0xe04f3f, 0.16)
      .setOrigin(0)
      .setScrollFactor(0)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setDepth(99990);
  }

  private drawBossOverlay(time: number) {
    if (!this.cpuBar) return;
    const cam = this.scene.cameras.main;
    // scrollFactor(0) objects are still zoom-scaled around the camera centre —
    // map desired screen coords back into that space so the bar stays put
    const z = cam.zoom;
    const toX = (sx: number) => (sx - cam.width / 2) / z + cam.width / 2;
    const toY = (sy: number) => (sy - cam.height / 2) / z + cam.height / 2;
    const barW = Math.min(360, cam.width - 48) / z;
    const barH = 18 / z;
    const x = toX((cam.width - Math.min(360, cam.width - 48)) / 2);
    const y = toY(66);
    const g = this.cpuBar;
    g.clear();
    g.fillStyle(0x151922, 0.72);
    g.fillRoundedRect(x - 8 / z, y - 8 / z, barW + 16 / z, barH + 16 / z, 10 / z);
    g.fillStyle(0x2a303b, 1);
    g.fillRoundedRect(x, y, barW, barH, 6 / z);
    const hot = this.cpu > 0.92;
    g.fillStyle(hot ? 0xe04f3f : 0xf0813a, 1);
    g.fillRoundedRect(x, y, Math.max(12 / z, barW * this.cpu), barH, 6 / z);
    if (this.redPulse) {
      this.redPulse.setPosition(toX(0), toY(0));
      this.redPulse.setSize(cam.width / z, cam.height / z);
      this.redPulse.setAlpha(0.08 + 0.1 * Math.abs(Math.sin(time * 0.005)) + (hot ? 0.1 : 0));
    }
  }

  private complete(m: MissionDef) {
    this.cleanup();
    this.active = null;
    gameStore.completeMission(m.id, m.rewardCoins);
    for (const ach of m.rewardAchievements ?? []) gameStore.award(ach);
    if (m.projectRef) {
      const anchor = WORLD.anchors.find((a) => a.content.ref === m.projectRef && a.content.contentKind === "project");
      const st = gameStore.getState();
      if (anchor && !st.discovered.includes(anchor.id)) {
        gameStore.set({ discovered: [...st.discovered, anchor.id] });
      }
    }
    this.audio.chord();
    this.fireworks.emitParticleAt(this.car.x, this.car.y - 70, 42);
    const banner = this.scene.add
      .text(this.car.x, this.car.y - 110, "ACHIEVEMENT UNLOCKED", {
        fontFamily: "ui-monospace, monospace",
        fontSize: "14px",
        color: "#20242c",
        backgroundColor: "rgba(244,237,224,0.92)",
      })
      .setOrigin(0.5)
      .setPadding(8, 4, 8, 4)
      .setDepth(99999);
    this.scene.tweens.add({
      targets: banner,
      y: this.car.y - 170,
      alpha: 0,
      duration: 1500,
      ease: "Cubic.out",
      onComplete: () => banner.destroy(),
    });
    toast.success(`${m.rewardText}  +${m.rewardCoins} coins`);
  }

  private fail(m: MissionDef, reason: string) {
    this.cleanup();
    this.active = null;
    gameStore.set({ activeMissionId: null, objective: null });
    this.lastObjective = "";
    this.audio.crash(0.5);
    toast(reason);
    this.addBeacon(m);
  }

  update(dt: number, time = 0) {
    if (!this.active) {
      for (const { mission } of this.beacons.values()) {
        if (Math.hypot(this.car.x - mission.giver.x, this.car.y - mission.giver.y) < mission.giver.radius) {
          this.start(mission);
          break;
        }
      }
      return;
    }

    const m = this.active;
    if (m.type === "boss" && m.stations) {
      this.updateBoss(m, dt, time);
    } else if (m.type === "delivery" && m.deliver) {
      if (this.pkg) this.pkg.setPosition(this.car.x, this.car.y - 4).setDepth(10 + this.car.y + 1);
      if (Math.hypot(this.car.x - m.deliver.x, this.car.y - m.deliver.y) < m.deliver.radius) this.complete(m);
    } else if (m.type === "race" && m.checkpoints) {
      this.timer -= dt;
      if (this.timer <= 0) return this.fail(m, "⏱️ Out of time — the build broke. Try again!");
      const cp = m.checkpoints[this.cpIndex];
      this.setObjective(`Checkpoint ${this.cpIndex + 1}/${m.checkpoints.length} — ${(this.timer / 1000).toFixed(1)}s`);
      if (Math.hypot(this.car.x - cp.x, this.car.y - cp.y) < cp.radius) {
        this.markers[this.cpIndex]?.destroy();
        this.cpIndex++;
        this.audio.ding(1.2);
        if (this.cpIndex >= m.checkpoints.length) return this.complete(m);
        this.markers[this.cpIndex]?.setAlpha(1);
      }
    } else if (m.type === "escape" && this.chaser) {
      this.timer -= dt;
      this.setObjective(`Escape the memory leak — survive ${(this.timer / 1000).toFixed(1)}s`);
      const speed = (m.chaserSpeed ?? 5) * (dt / 16.7);
      const dx = this.car.x - this.chaser.x;
      const dy = this.car.y - this.chaser.y;
      const d = Math.hypot(dx, dy) || 1;
      this.chaser.x += (dx / d) * speed;
      this.chaser.y += (dy / d) * speed;
      this.chaser.setDepth(10 + this.chaser.y);
      if (d < 62) return this.fail(m, "🐛 The memory leak got you! Respawning the mission…");
      if (this.timer <= 0) this.complete(m);
    }
  }

  private updateBoss(m: MissionDef, dt: number, time: number) {
    const stations = m.stations!;
    const ramp = m.cpuRampMs ?? 25000;
    // CPU climbs from 85% to 100% over the ramp
    this.cpu += (0.15 * dt) / ramp;

    // request blobs chase slowly and add load on touch
    for (const blob of this.chasers) {
      const dx = this.car.x - blob.x;
      const dy = this.car.y - blob.y;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 3.4 * (dt / 16.7);
      blob.x += (dx / d) * speed;
      blob.y += (dy / d) * speed;
      blob.setDepth(10 + blob.y);
      if (d < 70) {
        this.cpu = Math.min(1, this.cpu + 0.05);
        this.rig?.shake(0.003, 160);
        blob.setPosition(blob.x - (dx / d) * 380, blob.y - (dy / d) * 380); // knocked back
      }
    }

    if (this.cpu >= 1) {
      return this.fail(m, "📟 PagerDuty… CPU hit 100%. Rollback deployed — try again.");
    }

    const st = stations[this.cpIndex];
    this.setObjective(`Apply fix ${this.cpIndex + 1}/${stations.length}: ${st.label}`);
    this.drawBossOverlay(time);

    if (Math.hypot(this.car.x - st.x, this.car.y - st.y) < st.radius) {
      this.cpu = Math.max(0.2, this.cpu - 0.15);
      this.markers[this.cpIndex]?.destroy();
      this.cpIndex++;
      this.audio.ding(1.3);
      this.fireworks.emitParticleAt(st.x, st.y, 14);
      toast(`✔ ${st.label} applied — CPU −15%`, { duration: 1800 });
      if (this.cpIndex >= stations.length) {
        this.rig?.shake(0.005, 400);
        return this.complete(m);
      }
      this.markers[this.cpIndex]?.setAlpha(1);
    }
  }
}
