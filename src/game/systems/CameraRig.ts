import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import { gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";

// Smooth follow camera with velocity lookahead, speed/nitro zoom-out, a gentle
// zoom-in when idling beside a building, a subtle lean while drifting, and
// crash shake. Follows the (invisible) physics body so it tracks true position.

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private car: CarController;
  private target: Phaser.GameObjects.Zone;
  private targetZoom = TUNING.camZoom;
  private nearness = 0; // 0..1 closeness to the nearest anchor (set by the scene)
  private tilt = 0;
  private wasNitro = false;

  constructor(scene: Phaser.Scene, car: CarController, worldW: number, worldH: number) {
    this.cam = scene.cameras.main;
    this.car = car;
    this.target = scene.add.zone(car.x, car.y, 1, 1);
    this.cam.setBounds(0, 0, worldW, worldH);
    this.cam.startFollow(this.target, false, TUNING.camLerp, TUNING.camLerp);
    this.cam.setZoom(TUNING.camZoom);
    this.cam.setRoundPixels(true);
  }

  shake(intensity: number, durationMs = 180) {
    if (gameStore.getState().reducedMotion) return;
    this.cam.shake(durationMs, intensity);
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
    const v = this.car.body.body.velocity;
    const lookahead = 4 + this.car.speedNorm * 8;
    const desiredX = this.car.x + v.x * lookahead;
    const desiredY = this.car.y + v.y * lookahead;
    const lerp = Math.min(1, deltaMs * 0.0048);
    this.target.setPosition(
      this.target.x + (desiredX - this.target.x) * lerp,
      this.target.y + (desiredY - this.target.y) * lerp
    );

    // zoom priority: cinematic override > slow-roll beside a building > speed/nitro widen
    const zoomOut = this.car.nitroActive
      ? TUNING.camZoomNitro
      : TUNING.camZoom - this.car.speedNorm * TUNING.camZoomSpeedRange;
    const slow = Phaser.Math.Clamp(1 - this.car.speedNorm / 0.3, 0, 1);
    const near = this.nearness * slow;
    const nearZoom =
      near > 0.02 ? TUNING.camZoom + (TUNING.camZoomNear - TUNING.camZoom) * near : null;
    this.targetZoom = this.cinematicZoom ?? nearZoom ?? zoomOut;
    const z = this.cam.zoom;
    this.cam.setZoom(z + (this.targetZoom - z) * Math.min(1, deltaMs * 0.006));

    // a short kick the moment nitro engages
    if (this.car.nitroActive && !this.wasNitro) this.shake(140, 0.0015);
    this.wasNitro = this.car.nitroActive;

    // drift lean — locked out during missions/cinematics so screen-fixed
    // overlays (boss CPU bar) and reduced-motion users are never tilted
    const s = gameStore.getState();
    const allowTilt = !s.reducedMotion && !s.activeMissionId && this.cinematicZoom === null;
    const targetTilt =
      allowTilt && this.car.drifting ? -this.car.slipSign * TUNING.camTiltDrift : 0;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, deltaMs * 0.004);
    if (targetTilt === 0 && Math.abs(this.tilt) < 0.0004) this.tilt = 0;
    this.cam.setRotation(this.tilt);
  }
}
