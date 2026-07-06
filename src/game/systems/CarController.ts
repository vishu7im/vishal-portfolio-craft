import Phaser from "phaser";
import type { CarInput } from "../state/input";
import type { VehicleTuning } from "../config/tuning";
import { TEX_SS } from "../art/textureFactory";

// Top-down arcade car. Matter body handles collisions; handling (thrust,
// steering, lateral-grip drift, drag) is applied manually each step. The pretty
// car art is a separate visual that leans, squashes and hops for fake
// suspension — the physics body itself stays invisible.

const DEG = Math.PI / 180;

export class CarController {
  scene: Phaser.Scene;
  body: Phaser.Physics.Matter.Image;
  visual: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  tuning: VehicleTuning;

  // telemetry (read by the scene → frame channel)
  speedNorm = 0;
  rpm = 0;
  driftLoad = 0;
  lateralSlip = 0;
  slipSign = 1; // which side the tail is sliding toward (camera tilt direction)
  drifting = false;
  braking = false;
  reversing = false;
  nitroActive = false;
  /** handbrake + throttle at a standstill: wheels spin, car stays put */
  burnout = false;
  /** 0..1 extra body shake from rough ground (set by the scene on dirt roads) */
  surfaceRumble = 0;

  private roll = 0;
  private squash = 0;
  private prevForward = 0;
  private hopH = 0;
  private hopV = 0;
  private bump = 0;
  private steerSmoothed = 0;
  private throttleSmoothed = 0;
  private reverseSmoothed = 0;
  private stuckMs = 0;
  private boostMs = 0;
  private flipMs = 0;
  private flipDuration = 1;
  private flipBaseAngle = 0;
  private flipSpinDir = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, tuning: VehicleTuning) {
    this.scene = scene;
    this.tuning = tuning;

    this.body = scene.matter.add.image(x, y, `car-${tuning.key}`, undefined, {
      shape: { type: "rectangle", width: tuning.bodyW, height: tuning.bodyH },
      chamfer: { radius: 7 },
      frictionAir: 0.06,
      friction: 0.05,
      restitution: 0.35,
      mass: tuning.mass,
      label: "car",
    } as Phaser.Types.Physics.Matter.MatterBodyConfig);
    this.body.setVisible(false);
    this.body.setRotation(angle);
    this.body.setData("kind", "car");

    this.shadow = scene.add.image(x, y, "car-shadow").setAlpha(0.9);
    this.visual = scene.add.image(x, y, `car-${tuning.key}`).setScale(1 / TEX_SS);
  }

  setVehicle(tuning: VehicleTuning) {
    this.tuning = tuning;
    this.visual.setTexture(`car-${tuning.key}`);
  }

  onCollision(impactSpeed: number, obstacleX?: number, obstacleY?: number) {
    this.bump = 150;
    if (impactSpeed > 2) this.hopV = Math.min(0, this.hopV);
    this.body.setAngularVelocity(this.body.body.angularVelocity * 0.25);

    if (obstacleX == null || obstacleY == null || impactSpeed < 1.1) return;
    const dx = this.body.x - obstacleX;
    const dy = this.body.y - obstacleY;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const v = this.body.body.velocity;
    const intoObstacle = v.x * nx + v.y * ny;
    if (intoObstacle < 0) {
      this.body.setVelocity(
        (v.x - nx * intoObstacle * 1.35) * 0.55,
        (v.y - ny * intoObstacle * 1.35) * 0.55
      );
    } else {
      this.body.setVelocity(v.x * 0.72, v.y * 0.72);
    }
    this.body.setPosition(this.body.x + nx * 2.8, this.body.y + ny * 2.8);
  }

  flipFromCollision(impactSpeed: number, obstacleX: number, obstacleY: number) {
    if (this.flipMs > 0) return;

    this.onCollision(impactSpeed, obstacleX, obstacleY);

    const dx = this.body.x - obstacleX;
    const dy = this.body.y - obstacleY;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;
    const side = Math.sign(Math.sin(this.body.rotation) * nx - Math.cos(this.body.rotation) * ny) || 1;

    this.flipDuration = Phaser.Math.Clamp(620 + impactSpeed * 115, 760, 1180);
    this.flipMs = this.flipDuration;
    this.flipBaseAngle = this.body.rotation;
    this.flipSpinDir = side;
    this.throttleSmoothed = 0;
    this.reverseSmoothed = 0;
    this.steerSmoothed = 0;
    this.bump = Math.max(this.bump, 240);
    this.stuckMs = 0;
    this.hopH = 0;
    this.hopV = 0;
    this.squash = 0;

    const kick = Phaser.Math.Clamp(impactSpeed * 0.42, 1.8, 4.6);
    this.body.setVelocity(nx * kick, ny * kick);
    this.body.setAngularVelocity(0);
    this.body.setPosition(this.body.x + nx * 10, this.body.y + ny * 10);
  }

  hop(power = 5.2) {
    if (this.hopH <= 0.1) this.hopV = power;
  }

  boost(power = 520) {
    this.boostMs = Math.max(this.boostMs, power);
    this.hop(3.2);
  }

  get x() {
    return this.body.x;
  }
  get y() {
    return this.body.y;
  }
  get angle() {
    return this.body.rotation;
  }

  /** world positions of the two rear wheels (for tire marks & dust) */
  rearWheels(): [number, number, number, number] {
    const a = this.body.rotation;
    const fx = Math.cos(a),
      fy = Math.sin(a);
    const rx = -Math.sin(a),
      ry = Math.cos(a);
    const back = this.tuning.bodyW * 0.42;
    const side = this.tuning.bodyH * 0.55;
    const bx = this.body.x - fx * back;
    const by = this.body.y - fy * back;
    return [bx + rx * side, by + ry * side, bx - rx * side, by - ry * side];
  }

  update(input: CarInput, deltaMs: number) {
    if (this.flipMs > 0) {
      this.updateFlip(deltaMs);
      return;
    }

    const dt = deltaMs;
    const step = Phaser.Math.Clamp(deltaMs / 16.7, 0.5, 1.8);
    const T = this.tuning;
    const a = this.body.rotation;
    const fx = Math.cos(a),
      fy = Math.sin(a);
    const rx = -Math.sin(a),
      ry = Math.cos(a);

    const v = this.body.body.velocity;
    const speed = Math.hypot(v.x, v.y);
    const forwardDot = v.x * fx + v.y * fy;
    const dir = forwardDot >= -0.01 ? 1 : -1;

    this.throttleSmoothed +=
      (input.throttle - this.throttleSmoothed) * Math.min(1, step * (input.throttle ? 0.1 : 0.18));
    this.reverseSmoothed +=
      (input.reverse - this.reverseSmoothed) * Math.min(1, step * (input.reverse ? 0.16 : 0.2));
    this.steerSmoothed +=
      (input.steer - this.steerSmoothed) * Math.min(1, step * (input.steer ? 0.22 : 0.16));

    if (this.boostMs > 0) this.boostMs = Math.max(0, this.boostMs - deltaMs);

    const nitro = input.nitro && this.throttleSmoothed > 0.25 && speed > 1;
    this.nitroActive = nitro;
    const boostMul = this.boostMs > 0 ? 1.35 : 1;
    const nMul = (nitro ? T.nitroMul : 1) * boostMul;

    this.braking =
      (this.reverseSmoothed > 0.08 && forwardDot > 0.35) ||
      (this.throttleSmoothed > 0.08 && forwardDot < -0.3);

    // stationary burnout: the handbrake keeps the rear planted while the
    // throttle spins the wheels — no thrust until the handbrake is released
    this.burnout = input.handbrake && this.throttleSmoothed > 0.05 && speed < 2.0;

    // thrust and braking. Braking intentionally bites harder than acceleration.
    if (this.throttleSmoothed > 0 && !this.burnout) {
      const f =
        (forwardDot < -0.3 ? T.brakeForce : T.driveForce) *
        this.throttleSmoothed *
        nMul *
        step;
      this.body.applyForce(new Phaser.Math.Vector2(fx * f, fy * f));
    }
    if (this.reverseSmoothed > 0) {
      const f =
        (forwardDot > 0.35 ? T.brakeForce : T.reverseForce) *
        this.reverseSmoothed *
        step;
      this.body.applyForce(new Phaser.Math.Vector2(-fx * f, -fy * f));
    }
    if (this.boostMs > 0 && this.throttleSmoothed > 0.2) {
      const f = T.driveForce * 0.55 * step;
      this.body.applyForce(new Phaser.Math.Vector2(fx * f, fy * f));
    }

    // steering — smoothed, speed-scaled and damped back to straight when released.
    const speedFactor = Math.min(1, speed / 2.6);
    const lowSpeedAssist = this.throttleSmoothed > 0.1 || this.reverseSmoothed > 0.1 ? 0.28 : 0;
    const steeringPower = Phaser.Math.Clamp(lowSpeedAssist + speedFactor * 0.82, 0, 1);
    const targetAngular = this.steerSmoothed * T.turnRate * steeringPower * dir * (input.handbrake ? 1.08 : 1);
    const angular = this.body.body.angularVelocity;
    this.body.setAngularVelocity(angular + (targetAngular - angular) * Math.min(1, step * 0.28));

    // recompute velocity after force/rotation
    const nv = this.body.body.velocity;
    const fComp = nv.x * fx + nv.y * fy;
    const rComp = nv.x * rx + nv.y * ry;
    this.lateralSlip = Math.abs(rComp);
    this.slipSign = rComp >= 0 ? 1 : -1;
    this.reversing = forwardDot < -0.3 && this.reverseSmoothed > 0.08;

    this.drifting =
      (input.handbrake && speed > 2.8) ||
      (Math.abs(this.steerSmoothed) > 0.86 && speed > 6.4 && this.lateralSlip > 1.1);

    if (this.bump > 0) {
      // just bumped something — let Matter own the bounce for a moment
      this.bump -= dt;
      this.body.setVelocity(nv.x * 0.96, nv.y * 0.96);
    } else {
      const grip = 1 - Math.pow(1 - (this.drifting ? T.gripDrift : T.gripNormal), step);
      const keptR = rComp * (1 - grip);
      let ox = fx * fComp + rx * keptR;
      let oy = fy * fComp + ry * keptR;
      const noThrottle = this.throttleSmoothed < 0.03 && this.reverseSmoothed < 0.03;
      const dragF = this.braking ? 0.86 : input.handbrake ? 0.955 : noThrottle ? 0.968 : T.drag;
      const drag = Math.pow(dragF, step);
      ox *= drag;
      oy *= drag;
      const reverseCap = fComp < -0.2 ? T.maxSpeed * 0.44 : T.maxSpeed;
      const maxS = reverseCap * nMul;
      const sp = Math.hypot(ox, oy);
      if (sp > maxS) {
        ox = (ox / sp) * maxS;
        oy = (oy / sp) * maxS;
      }
      this.body.setVelocity(ox, oy);

      const alignedSpeed = Math.hypot(ox, oy);
      if (!this.drifting && alignedSpeed > 1.2) {
        const velAngle = Math.atan2(oy, ox) + (fComp < -0.2 ? Math.PI : 0);
        const diff = Phaser.Math.Angle.Wrap(velAngle - this.body.rotation);
        const steerPenalty = Math.abs(this.steerSmoothed) * 0.02;
        const align = Math.max(0.012, 0.045 - steerPenalty);
        this.body.setRotation(this.body.rotation + diff * align * step);
      }
    }

    const wantsMove = this.throttleSmoothed > 0.35 || this.reverseSmoothed > 0.35;
    if (wantsMove && speed < 0.18) this.stuckMs += deltaMs;
    else this.stuckMs = Math.max(0, this.stuckMs - deltaMs * 2);
    if (this.stuckMs > 420) {
      const sign = this.throttleSmoothed >= this.reverseSmoothed ? 1 : -1;
      this.body.setPosition(this.body.x + fx * sign * 5, this.body.y + fy * sign * 5);
      this.body.setVelocity(fx * sign * 0.75, fy * sign * 0.75);
      this.stuckMs = 0;
    }

    // --- telemetry ---
    const finalSpeed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    this.speedNorm = Math.min(1, finalSpeed / T.maxSpeed);
    this.driftLoad = Math.min(1, (this.lateralSlip * (this.drifting ? 1 : 0.18)) / 3.2);
    this.rpm = Math.min(
      1,
      0.12 + this.throttleSmoothed * 0.48 + this.speedNorm * 0.42 + (nitro ? 0.15 : 0)
    );

    // --- fake suspension visuals ---
    // body roll away from the turn while drifting
    const targetRoll = -this.steerSmoothed * speedFactor * (0.055 + this.driftLoad * 0.08);
    this.roll += (targetRoll - this.roll) * Math.min(1, dt * 0.02);
    // pitch squash on hard longitudinal accel change
    const accel = fComp - this.prevForward;
    this.prevForward = fComp;
    const targetSquash = Phaser.Math.Clamp(-accel * 0.06, -0.1, 0.14);
    this.squash += (targetSquash - this.squash) * Math.min(1, dt * 0.02);

    // hop integration
    if (this.hopH > 0 || this.hopV > 0) {
      this.hopH += this.hopV * (dt / 16.7);
      this.hopV -= 0.55 * (dt / 16.7);
      if (this.hopH <= 0) {
        this.hopH = 0;
        this.hopV = 0;
        this.squash = 0.16; // landing squash
      }
    }

    // apply to visual
    const base = 1 / TEX_SS;
    const roadBounce =
      finalSpeed > 2
        ? Math.sin(
            this.scene.time.now * (0.022 + this.surfaceRumble * 0.012) +
              this.body.x * 0.018 +
              this.body.y * 0.011
          ) *
          this.speedNorm *
          (0.55 + this.surfaceRumble * 1.0)
        : Math.sin(this.scene.time.now * 0.0075) * 0.35; // engine idling — faint rock
    const idleRoll = finalSpeed <= 2 ? Math.sin(this.scene.time.now * 0.013) * 0.006 : 0;
    const lift = this.hopH + roadBounce;
    this.visual.setPosition(this.body.x, this.body.y - lift);
    this.visual.setRotation(a + this.roll + idleRoll);
    this.visual.setScale(
      base * (1 + this.squash * 0.5 + lift * 0.02),
      base * (1 - this.squash + lift * 0.02)
    );
    const shadowScale = 1 - Math.min(0.5, lift * 0.03);
    this.shadow.setPosition(this.body.x + Math.cos(a) * 1.5, this.body.y + 3 + lift * 0.15);
    this.shadow.setRotation(a);
    this.shadow.setScale(shadowScale);
    this.shadow.setAlpha(0.9 - Math.min(0.5, lift * 0.04));

    const depth = 10 + this.body.y;
    this.visual.setDepth(depth);
    this.shadow.setDepth(depth - 4);
  }

  private updateFlip(deltaMs: number) {
    this.flipMs = Math.max(0, this.flipMs - deltaMs);
    const p = Phaser.Math.Clamp(1 - this.flipMs / this.flipDuration, 0, 1);
    const up = Math.sin(p * Math.PI);
    const settle = Phaser.Math.Easing.Cubic.Out(p);
    const spin = this.flipSpinDir * Math.PI * 2 * (1.05 - 0.05 * settle);
    const lift = up * 34;
    const wobble = Math.sin(p * Math.PI * 5) * (1 - p) * 0.18;

    const v = this.body.body.velocity;
    this.body.setVelocity(v.x * 0.955, v.y * 0.955);
    this.body.setAngularVelocity(0);
    this.body.setRotation(this.flipBaseAngle);

    this.speedNorm = Math.min(1, Math.hypot(v.x, v.y) / this.tuning.maxSpeed);
    this.rpm = Math.max(0.12, this.speedNorm * 0.24);
    this.driftLoad = 0;
    this.lateralSlip = 0;
    this.drifting = false;
    this.braking = false;
    this.reversing = false;
    this.nitroActive = false;
    this.burnout = false;

    const base = 1 / TEX_SS;
    const squash = p > 0.82 ? (p - 0.82) * 0.9 : 0;
    this.visual.setPosition(this.body.x, this.body.y - lift);
    this.visual.setRotation(this.flipBaseAngle + spin * p + wobble);
    this.visual.setScale(base * (1 + up * 0.16 + squash * 0.22), base * (1 - squash * 0.4));

    const shadowScale = 1 - up * 0.45;
    this.shadow.setPosition(this.body.x + Math.cos(this.flipBaseAngle) * 1.5, this.body.y + 3 + lift * 0.18);
    this.shadow.setRotation(this.flipBaseAngle);
    this.shadow.setScale(shadowScale);
    this.shadow.setAlpha(0.9 - up * 0.55);

    const depth = 10 + this.body.y;
    this.visual.setDepth(depth);
    this.shadow.setDepth(depth - 4);

    if (this.flipMs <= 0) {
      this.visual.setRotation(this.body.rotation);
      this.visual.setScale(base);
      this.shadow.setScale(1);
      this.shadow.setAlpha(0.9);
      this.squash = 0.18;
      this.bump = 120;
    }
  }
}

export { DEG };
