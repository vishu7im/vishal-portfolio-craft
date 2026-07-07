import Phaser from "phaser";
import { AmbientKit } from "./AmbientKit";

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

/**
 * Everything that reacts to the car brushing past props, plus the night-time
 * glow pass: bush/tree jostle, ambient chimney smoke, server sparks, puddle
 * ripples, warm window glows after dark, and the car's headlight pool.
 */
export class ReactiveProps {
  private readonly kit: AmbientKit;
  private readonly props: ReactiveProp[] = [];
  private readonly serverDots: Phaser.GameObjects.GameObject[] = [];
  private readonly nightGlows: Array<{ img: Phaser.GameObjects.Image; max: number }> = [];
  private readonly lampGlows = new Map<Phaser.GameObjects.Image, Phaser.GameObjects.Image>();
  private headlights?: Phaser.GameObjects.Image;

  constructor(kit: AmbientKit) {
    this.kit = kit;
    this.collectExistingProps();
  }

  update(time: number, delta: number) {
    this.updateReactiveProps(time, delta);
    this.updateNightGlows(time);
  }

  destroy() {
    this.serverDots.forEach((o) => o.destroy());
    this.nightGlows.forEach((g) => g.img.destroy());
    this.headlights?.destroy();
  }

  private collectExistingProps() {
    const scene = this.kit.scene;
    for (const obj of scene.children.getAll()) {
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
        scene.tweens.add({
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
        const glow = scene.add
          .image(obj.x, obj.y - 28, "glow")
          .setTint(0xffe9a8)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setScale(0.42)
          .setAlpha(0.2)
          .setDepth(obj.depth - 1);
        this.serverDots.push(glow);
        this.lampGlows.set(obj, glow);
        scene.tweens.add({
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
        const glow = scene.add
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
        scene.tweens.add({
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
    const scene = this.kit.scene;
    for (let i = 0; i < 3; i++) {
      const dot = scene.add
        .circle(server.x - 13 + i * 12, server.y - 9 + i * 13, 3, i % 2 ? 0x4ce0a0 : 0x39a0f0, 0.7)
        .setDepth(server.depth + 2);
      this.serverDots.push(dot);
      scene.tweens.add({
        targets: dot,
        alpha: 0.12,
        duration: Phaser.Math.Between(360, 900),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 700),
      });
    }
  }

  /** a hard hit makes a lamp lean, spark and flicker */
  onLampHit(img: Phaser.GameObjects.Image) {
    const scene = this.kit.scene;
    const base = this.props.find((p) => p.img === img)?.rotation ?? 0;
    this.kit.sparks.emitParticleAt(img.x, img.y - 34, 6);
    scene.tweens.add({
      targets: img,
      rotation: base + (Math.random() < 0.5 ? -0.18 : 0.18),
      duration: 110,
      yoyo: true,
      ease: "Sine.out",
      onComplete: () => img.setRotation(base),
    });
    const glow = this.lampGlows.get(img);
    if (glow) {
      scene.tweens.add({
        targets: glow,
        alpha: 0.05,
        duration: 90,
        yoyo: true,
        repeat: 5,
      });
    }
  }

  private updateReactiveProps(time: number, delta: number) {
    const car = this.kit.car;
    const carX = car.x;
    const carY = car.y;
    const speed = car.speedNorm;

    for (const p of this.props) {
      p.cooldown = Math.max(0, p.cooldown - delta);
      const d = Math.hypot(carX - p.x, carY - p.y);

      if (p.kind === "bush" && d < 95) {
        const push = 1 - d / 95;
        p.img.setScale(p.scaleX * (1 + push * 0.12), p.scaleY * (1 - push * 0.08));
        p.img.setRotation(p.rotation + Math.sin(time * 0.028 + p.x) * push * 0.18);
        if (p.cooldown <= 0 && speed > 0.12) {
          p.cooldown = 420;
          this.kit.leaves.emitParticleAt(p.x, p.y, 5);
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
        this.kit.leaves.emitParticleAt(p.x, p.y - 40, p.kind === "palm" ? 4 : 8);
      }

      if (p.kind === "server" && Math.random() < 0.0009) this.kit.sparks.emitParticleAt(p.x, p.y - 18, 2);
      if (p.kind === "silo" && Math.random() < 0.0016) this.kit.smoke.emitParticleAt(p.x, p.y - 52, 1);
      if (p.kind === "cafe" && Math.random() < 0.003) this.kit.smoke.emitParticleAt(p.x, p.y - 58, 1);
      if (p.kind === "factory" && Math.random() < 0.002) this.kit.smoke.emitParticleAt(p.x + 78, p.y - 92, 1);
      if (p.kind === "puddle" && Math.random() < 0.002) this.kit.spawnRipple(p.x, p.y, p.scaleX);
    }
  }

  private updateNightGlows(time: number) {
    const scene = this.kit.scene;
    const car = this.kit.car;
    const night = this.kit.dayNight?.nightness ?? 0;
    if (night <= 0.01 && this.nightGlows[0]?.img.alpha === 0 && !this.headlights?.alpha) return;
    for (const g of this.nightGlows) {
      g.img.setAlpha(night * g.max * (0.9 + 0.1 * Math.sin(time * 0.004 + g.img.x)));
    }
    // headlight pool ahead of the car after dark
    if (!this.headlights) {
      this.headlights = scene.add
        .image(0, 0, "glow")
        .setTint(0xfff2c8)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(2.6, 1.7)
        .setAlpha(0)
        .setDepth(9);
    }
    const a = car.angle;
    this.headlights
      .setPosition(car.x + Math.cos(a) * 120, car.y + Math.sin(a) * 120)
      .setRotation(a)
      .setAlpha(night * 0.55);
  }
}
