import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import { gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";

// Smooth follow camera with a small deadzone, a gentle zoom-out under nitro, and
// crash shake. Follows the (invisible) physics body so it tracks true position.

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private car: CarController;
  private target: Phaser.GameObjects.Zone;
  private targetZoom = TUNING.camZoom;

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

    // speed + nitro widen the view a touch for a sense of pace
    const zoomOut = this.car.nitroActive ? TUNING.camZoomNitro : TUNING.camZoom - this.car.speedNorm * 0.04;
    this.targetZoom = this.cinematicZoom ?? zoomOut;
    const z = this.cam.zoom;
    this.cam.setZoom(z + (this.targetZoom - z) * Math.min(1, deltaMs * 0.006));
  }
}
