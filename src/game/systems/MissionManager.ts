import Phaser from "phaser";
import toast from "react-hot-toast";
import type { MissionDef } from "../types";
import { WORLD } from "../world";
import { gameStore } from "../state/gameStore";
import { TEX_SS } from "../art/textureFactory";
import type { CarController } from "./CarController";
import type { AudioSystem } from "./AudioSystem";

// Runs all missions: delivery (carry a package to a drop), race (hit checkpoints
// before the clock), and escape (outrun the memory-leak monster). Missions start
// by driving into their beacon; only one runs at a time; each explains a project.

interface Beacon {
  mission: MissionDef;
  glow: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
}

export class MissionManager {
  private scene: Phaser.Scene;
  private car: CarController;
  private audio: AudioSystem;
  private beacons = new Map<string, Beacon>();

  private active: MissionDef | null = null;
  private pkg?: Phaser.GameObjects.Image;
  private markers: Phaser.GameObjects.Image[] = [];
  private chaser?: Phaser.GameObjects.Container;
  private fireworks: Phaser.GameObjects.Particles.ParticleEmitter;
  private cpIndex = 0;
  private timer = 0;
  private lastObjective = "";

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
  }

  private start(m: MissionDef) {
    this.active = m;
    this.removeBeacon(m.id);
    gameStore.startMission(m.id, m.title);
    this.lastObjective = m.title;
    this.audio.ding(0.9);
    toast(`🎯 ${m.title}: ${m.brief}`);

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

  private complete(m: MissionDef) {
    this.cleanup();
    this.active = null;
    gameStore.completeMission(m.id, m.rewardCoins);
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
    this.addBeacon(m); // let the player retry
  }

  update(dt: number) {
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
    if (m.type === "delivery" && m.deliver) {
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
}
