import Phaser from "phaser";
import { carInput } from "../state/input";
import { gameStore, frame } from "../state/gameStore";
import type { CarController } from "./CarController";
import type { CameraRig } from "./CameraRig";
import type { DayNightSystem } from "./DayNightSystem";
import type { TireMarks } from "./TireMarks";

// All car-attached juice in one place: drift smoke off both rear wheels,
// nitro flames + screen-edge speed streaks, idle exhaust, brake lights that
// double as night taillights, and a hold-to-burnout launch. Everything is
// particle/pool based and skips itself under prefers-reduced-motion.

const STREAK_COUNT = 6;
const STREAK_ON = 0.72; // speedNorm where streaks fade in
const BURNOUT_LAUNCH_MS = 600;

export class CarFxSystem {
  private readonly scene: Phaser.Scene;
  private readonly car: CarController;
  private readonly rig: CameraRig;
  private readonly tire: TireMarks;
  private readonly dayNight: DayNightSystem;

  private smokeGrey: Phaser.GameObjects.Particles.ParticleEmitter;
  private smokeDirt: Phaser.GameObjects.Particles.ParticleEmitter;
  private flames: Phaser.GameObjects.Particles.ParticleEmitter;
  private nitroGlow: Phaser.GameObjects.Image;
  private brakeL: Phaser.GameObjects.Image;
  private brakeR: Phaser.GameObjects.Image;
  private streaks: Array<{ img: Phaser.GameObjects.Image; sx: number; sy: number }> = [];

  private exhaustAt = 0;
  private wasThrottle = false;
  private burnoutMs = 0;
  private burnoutStampAt = 0;
  private nitroShakeAt = 0;

  constructor(
    scene: Phaser.Scene,
    car: CarController,
    rig: CameraRig,
    tire: TireMarks,
    dayNight: DayNightSystem
  ) {
    this.scene = scene;
    this.car = car;
    this.rig = rig;
    this.tire = tire;
    this.dayNight = dayNight;

    this.smokeGrey = scene.add
      .particles(0, 0, "soft", {
        tint: 0xb6bcc6,
        speed: { min: 20, max: 90 },
        scale: { start: 0.55, end: 0.1 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 700,
        emitting: false,
      })
      .setDepth(99968);

    this.smokeDirt = scene.add
      .particles(0, 0, "soft", {
        tint: 0xa87f4e,
        speed: { min: 20, max: 90 },
        scale: { start: 0.55, end: 0.1 },
        alpha: { start: 0.55, end: 0 },
        lifespan: 650,
        emitting: false,
      })
      .setDepth(99968);

    this.flames = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x6ad2ff, 0x8c7cff],
        speed: { min: 60, max: 160 },
        scale: { start: 0.55, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: 280,
        blendMode: Phaser.BlendModes.ADD,
        emitting: false,
      })
      .setDepth(99969);

    this.nitroGlow = scene.add
      .image(0, 0, "glow")
      .setTint(0x59c8ff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.5, 0.5)
      .setAlpha(0);

    const mkBrake = () =>
      scene.add
        .image(0, 0, "glow")
        .setTint(0xff5040)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScale(0.34, 0.26)
        .setAlpha(0);
    this.brakeL = mkBrake();
    this.brakeR = mkBrake();

    for (let i = 0; i < STREAK_COUNT; i++) {
      const img = scene.add
        .image(0, 0, "glow")
        .setTint(0xffffff)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setScrollFactor(0)
        .setScale(2.6, 0.06)
        .setAlpha(0)
        .setDepth(96000);
      this.streaks.push({ img, sx: 0, sy: 0 });
    }
    this.seedStreaks();
  }

  destroy() {
    this.smokeGrey.destroy();
    this.smokeDirt.destroy();
    this.flames.destroy();
    this.nitroGlow.destroy();
    this.brakeL.destroy();
    this.brakeR.destroy();
    for (const s of this.streaks) s.img.destroy();
  }

  /** stationary wheelspin in progress (audio roars while this holds) */
  get burnoutActive() {
    return this.burnoutMs > 120;
  }

  update(time: number, delta: number) {
    const car = this.car;
    const reduced = gameStore.getState().reducedMotion;
    const a = car.angle;
    const fx = Math.cos(a);
    const fy = Math.sin(a);
    const rearX = car.x - fx * car.tuning.bodyW * 0.55;
    const rearY = car.y - fy * car.tuning.bodyW * 0.55;
    const smoke = frame.onDirt ? this.smokeDirt : this.smokeGrey;

    // --- drift smoke: both rear wheels, density follows driftLoad ---
    if (car.drifting && car.lateralSlip > 1.2) {
      const [x1, y1, x2, y2] = car.rearWheels();
      const n = reduced ? 1 : car.driftLoad > 0.55 ? 3 : 2;
      smoke.emitParticleAt(x1, y1, n);
      smoke.emitParticleAt(x2, y2, n);
    } else if (frame.onDirt && car.speedNorm > 0.3) {
      // kicked-up dust just from driving a dirt road
      smoke.emitParticleAt(rearX, rearY, 1);
    }

    // --- nitro: rear flames + trailing glow + micro shake pulses ---
    if (car.nitroActive) {
      this.flames.emitParticleAt(rearX, rearY, 2);
      this.nitroGlow
        .setPosition(rearX - fx * 14, rearY - fy * 14)
        .setRotation(a)
        .setAlpha(0.4 + Math.sin(time * 0.03) * 0.15)
        .setDepth(10 + car.y - 2);
      if (!reduced && time > this.nitroShakeAt) {
        this.nitroShakeAt = time + 280;
        this.rig.shake(0.0007, 120);
      }
    } else if (this.nitroGlow.alpha > 0) {
      this.nitroGlow.setAlpha(Math.max(0, this.nitroGlow.alpha - delta * 0.004));
    }

    // --- exhaust puffs while idling / on throttle tip-in ---
    const throttleOn = carInput.throttle > 0.3;
    if (car.speedNorm < 0.3 && time > this.exhaustAt) {
      this.exhaustAt = time + (throttleOn ? 320 : 650);
      const puffs = throttleOn && !this.wasThrottle ? 3 : 1;
      this.smokeGrey.emitParticleAt(
        rearX + Phaser.Math.FloatBetween(-2, 2),
        rearY + Phaser.Math.FloatBetween(-2, 2),
        puffs
      );
    }
    this.wasThrottle = throttleOn;

    // --- brake lights (double as taillights after dark) ---
    const [lx, ly, rxw, ryw] = car.rearWheels();
    const night = this.dayNight.nightness;
    const glow = Math.max(car.braking ? 0.85 : 0, night * 0.45);
    const d = 10 + car.y + 3;
    this.brakeL.setPosition(lx, ly).setRotation(a).setAlpha(glow).setDepth(d);
    this.brakeR.setPosition(rxw, ryw).setRotation(a).setAlpha(glow).setDepth(d);

    // --- burnout: hold handbrake + throttle at a standstill, release to launch ---
    if (car.burnout) {
      this.burnoutMs += delta;
      const [x1, y1, x2, y2] = car.rearWheels();
      smoke.emitParticleAt(x1, y1, reduced ? 1 : 3);
      smoke.emitParticleAt(x2, y2, reduced ? 1 : 3);
      if (time > this.burnoutStampAt) {
        this.burnoutStampAt = time + 90;
        this.tire.burnout(car);
      }
    } else {
      if (this.burnoutMs >= BURNOUT_LAUNCH_MS && !carInput.handbrake && carInput.throttle > 0.4) {
        car.boost(420);
        this.flames.emitParticleAt(rearX, rearY, 10);
        this.rig.shake(0.0012, 160);
      }
      this.burnoutMs = 0;
    }

    // --- screen-edge speed streaks ---
    this.updateStreaks(delta, reduced);
  }

  private seedStreaks() {
    for (const s of this.streaks) {
      s.sx = Phaser.Math.Between(0, this.scene.scale.width);
      s.sy = Phaser.Math.Between(0, this.scene.scale.height);
    }
  }

  private updateStreaks(delta: number, reduced: boolean) {
    const car = this.car;
    const cam = this.scene.cameras.main;
    const strength = reduced
      ? 0
      : car.nitroActive
        ? 1
        : Phaser.Math.Clamp((car.speedNorm - STREAK_ON) / (1 - STREAK_ON), 0, 1);
    if (strength <= 0) {
      for (const s of this.streaks) if (s.img.alpha > 0) s.img.setAlpha(0);
      return;
    }
    const h = car.angle;
    const vx = -Math.cos(h);
    const vy = -Math.sin(h);
    const pxPerMs = 0.55 + strength * 0.5;
    const w = cam.width;
    const hh = cam.height;
    const z = cam.zoom;
    const margin = 80;
    for (const s of this.streaks) {
      s.sx += vx * pxPerMs * delta;
      s.sy += vy * pxPerMs * delta;
      if (s.sx < -margin || s.sx > w + margin || s.sy < -margin || s.sy > hh + margin) {
        // respawn upstream, biased toward the edges so the centre stays readable
        s.sx = w / 2 + Math.cos(h) * w * 0.55 + Phaser.Math.Between(-w / 3, w / 3);
        s.sy = hh / 2 + Math.sin(h) * hh * 0.55 + Phaser.Math.Between(-hh / 3, hh / 3);
      }
      // screen-fixed objects are zoom-scaled around the camera centre — compensate
      s.img.setPosition((s.sx - w / 2) / z + w / 2, (s.sy - hh / 2) / z + hh / 2);
      s.img.setRotation(h);
      const edge = Math.min(
        1,
        (Math.abs(s.sx - w / 2) / (w / 2) + Math.abs(s.sy - hh / 2) / (hh / 2)) * 0.9
      );
      s.img.setAlpha(0.22 * strength * (0.35 + edge * 0.65));
    }
  }
}
