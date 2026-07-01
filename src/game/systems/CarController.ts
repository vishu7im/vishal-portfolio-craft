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
  drifting = false;
  nitroActive = false;

  private roll = 0;
  private squash = 0;
  private prevForward = 0;
  private hopH = 0;
  private hopV = 0;
  private bump = 0;

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

  onCollision(impactSpeed: number) {
    this.bump = 150;
    if (impactSpeed > 2) this.hopV = Math.min(0, this.hopV);
  }

  hop(power = 5.2) {
    if (this.hopH <= 0.1) this.hopV = power;
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
    const dt = deltaMs;
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

    const nitro = input.nitro && input.throttle > 0 && speed > 1;
    this.nitroActive = nitro;
    const nMul = nitro ? T.nitroMul : 1;

    // thrust
    if (input.throttle > 0) {
      const f = T.driveForce * input.throttle * nMul;
      this.body.applyForce(new Phaser.Math.Vector2(fx * f, fy * f));
    }
    if (input.reverse > 0) {
      const f = T.reverseForce * input.reverse;
      this.body.applyForce(new Phaser.Math.Vector2(-fx * f, -fy * f));
    }

    // steering — angular velocity scaled by speed; reversed when reversing
    const speedFactor = Math.min(1, speed / 2.2);
    this.body.setAngularVelocity(input.steer * T.turnRate * speedFactor * dir);

    // recompute velocity after force/rotation
    const nv = this.body.body.velocity;
    const fComp = nv.x * fx + nv.y * fy;
    const rComp = nv.x * rx + nv.y * ry;

    this.drifting = input.handbrake || (Math.abs(input.steer) > 0.65 && speed > 4.5);

    if (this.bump > 0) {
      // just bumped something — let Matter own the bounce for a moment
      this.bump -= dt;
      this.body.setVelocity(nv.x * 0.99, nv.y * 0.99);
    } else {
      const grip = this.drifting ? T.gripDrift : T.gripNormal;
      const keptR = rComp * (1 - grip);
      let ox = fx * fComp + rx * keptR;
      let oy = fy * fComp + ry * keptR;
      const dragF = input.handbrake ? 0.94 : T.drag;
      ox *= dragF;
      oy *= dragF;
      const maxS = T.maxSpeed * nMul;
      const sp = Math.hypot(ox, oy);
      if (sp > maxS) {
        ox = (ox / sp) * maxS;
        oy = (oy / sp) * maxS;
      }
      this.body.setVelocity(ox, oy);
    }

    // --- telemetry ---
    const finalSpeed = Math.hypot(this.body.body.velocity.x, this.body.body.velocity.y);
    this.speedNorm = Math.min(1, finalSpeed / T.maxSpeed);
    this.driftLoad = Math.min(1, (Math.abs(rComp) * (this.drifting ? 1 : 0.25)) / 3);
    this.rpm = Math.min(
      1,
      0.14 + input.throttle * 0.5 + this.speedNorm * 0.42 + (nitro ? 0.15 : 0)
    );

    // --- fake suspension visuals ---
    // body roll away from the turn while drifting
    const targetRoll = -input.steer * (0.06 + this.driftLoad * 0.14);
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
    const lift = this.hopH;
    this.visual.setPosition(this.body.x, this.body.y - lift);
    this.visual.setRotation(a + this.roll);
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
}

export { DEG };
