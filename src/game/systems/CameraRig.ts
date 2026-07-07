import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import { gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";

// Follow camera adapted from the reference View.js feel model (docs/
// REDESIGN_ROADMAP.md, Phase 4):
//   • magnet follow — the follow target chases the car with a rate that grows
//     with distance, so it trails with a soft look-ahead at speed yet settles
//     cleanly at rest (no jitter, no snap);
//   • speed zoom — the view smoothly widens with speed for a sense of velocity;
//   • roll kick — a damped harmonic oscillator tilts the camera on impacts and
//     boost, then springs back to level.
// Reduced-motion users get the follow + zoom but no roll/shake.

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private car: CarController;
  private target: Phaser.GameObjects.Zone;
  private targetZoom = TUNING.camZoom;
  private nearness = 0; // 0..1 closeness to the nearest anchor (set by the scene)

  // smoothed follow point (magnet)
  private focusX: number;
  private focusY: number;

  // drift lean + impact roll (both radians, summed into camera rotation)
  private tilt = 0;
  private roll = 0;
  private rollSpeed = 0;

  private wasNitro = false;

  constructor(scene: Phaser.Scene, car: CarController, worldW: number, worldH: number) {
    this.cam = scene.cameras.main;
    this.car = car;
    this.focusX = car.x;
    this.focusY = car.y;
    this.target = scene.add.zone(car.x, car.y, 1, 1);
    this.cam.setBounds(0, 0, worldW, worldH);
    // We smooth the target position ourselves, so let the camera track it rigidly.
    this.cam.startFollow(this.target, false, TUNING.camLerp, TUNING.camLerp);
    this.cam.setZoom(TUNING.camZoom);
    this.cam.setRoundPixels(true);
  }

  shake(intensity: number, durationMs = 180) {
    if (gameStore.getState().reducedMotion) return;
    this.cam.shake(durationMs, Math.min(intensity, 0.003));
  }

  /** Kick the impact-roll spring by `strength` (≈ collision force). Springs back
   *  to level on its own; skipped under reduced-motion. */
  kick(strength = 1) {
    if (gameStore.getState().reducedMotion) return;
    // random sign so repeated hits don't always tilt the same way
    this.rollSpeed += strength * TUNING.camRollKick * (Math.random() < 0.5 ? -1 : 1);
  }

  /** temporary cinematic zoom override; pass null to release back to normal */
  private cinematicZoom: number | null = null;
  zoomTo(zoom: number | null) {
    this.cinematicZoom = zoom;
  }

  /** 0..1 closeness to the nearest portfolio anchor; drives the slow-roll zoom-in */
  setNearness(t: number) {
    this.nearness = t;
  }

  update(deltaMs: number) {
    const speed = this.car.speedNorm;
    const dt = Math.min(deltaMs, 33) / 1000; // clamp spikes (reference clamps to 1/30)

    // --- magnet follow: chase the car with a distance-proportional rate ---
    const dx = this.car.x - this.focusX;
    const dy = this.car.y - this.focusY;
    const dist = Math.hypot(dx, dy);
    const rate =
      TUNING.camMagnetBase + TUNING.camMagnetGain * Math.min(dist, TUNING.camMagnetDistCap);
    const k = 1 - Math.exp(-rate * dt); // frame-rate-independent ease factor
    this.focusX += dx * k;
    this.focusY += dy * k;
    this.target.setPosition(this.focusX, this.focusY);

    // --- zoom: cinematic override > slow-roll beside a building > speed widen ---
    const zoomOut = this.car.nitroActive
      ? TUNING.camZoomNitro
      : TUNING.camZoom - speed * TUNING.camZoomSpeedRange;
    const slow = Phaser.Math.Clamp(1 - speed / 0.3, 0, 1);
    const near = this.nearness * slow;
    const nearZoom =
      near > 0.02 ? TUNING.camZoom + (TUNING.camZoomNear - TUNING.camZoom) * near : null;
    this.targetZoom = this.cinematicZoom ?? nearZoom ?? zoomOut;
    const zk = 1 - Math.exp(-TUNING.camZoomSmooth * dt);
    this.cam.setZoom(this.cam.zoom + (this.targetZoom - this.cam.zoom) * zk);

    // a short kick the moment nitro engages
    if (this.car.nitroActive && !this.wasNitro) {
      this.shake(0.0008, 120);
      this.kick(0.28);
    }
    this.wasNitro = this.car.nitroActive;

    // --- impact roll: damped harmonic oscillator, springs back to level ---
    // (reference View.setRoll). Runs harmlessly at 0 when never kicked.
    this.rollSpeed += -this.roll * TUNING.camRollPull * dt;
    this.roll += this.rollSpeed * dt;
    this.rollSpeed *= Math.max(0, 1 - TUNING.camRollDamping * dt);
    if (Math.abs(this.roll) < 0.0002 && Math.abs(this.rollSpeed) < 0.0002) {
      this.roll = 0;
      this.rollSpeed = 0;
    }

    // --- drift lean — locked out during missions/cinematics so screen-fixed
    // overlays (boss CPU bar) and reduced-motion users are never tilted ---
    const s = gameStore.getState();
    const allowTilt =
      !s.reducedMotion && !s.activeMissionId && this.cinematicZoom === null && speed < 0.72;
    const targetTilt =
      allowTilt && this.car.drifting ? -this.car.slipSign * TUNING.camTiltDrift : 0;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, deltaMs * 0.0025);
    if (targetTilt === 0 && Math.abs(this.tilt) < 0.0004) this.tilt = 0;

    this.cam.setRotation(this.tilt + this.roll);
  }
}
