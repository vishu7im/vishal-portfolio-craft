import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import type { CarController } from "./CarController";

// Smooth follow camera with a small deadzone, a gentle zoom-out under nitro, and
// crash shake. Follows the (invisible) physics body so it tracks true position.

export class CameraRig {
  private cam: Phaser.Cameras.Scene2D.Camera;
  private car: CarController;
  private targetZoom = TUNING.camZoom;

  constructor(scene: Phaser.Scene, car: CarController, worldW: number, worldH: number) {
    this.cam = scene.cameras.main;
    this.car = car;
    this.cam.setBounds(0, 0, worldW, worldH);
    this.cam.startFollow(car.body, false, TUNING.camLerp, TUNING.camLerp);
    this.cam.setZoom(TUNING.camZoom);
    this.cam.setRoundPixels(true);
  }

  shake(intensity: number, durationMs = 180) {
    this.cam.shake(durationMs, intensity);
  }

  update(deltaMs: number) {
    // speed + nitro widen the view a touch for a sense of pace
    const zoomOut = this.car.nitroActive ? TUNING.camZoomNitro : TUNING.camZoom - this.car.speedNorm * 0.04;
    this.targetZoom = zoomOut;
    const z = this.cam.zoom;
    this.cam.setZoom(z + (this.targetZoom - z) * Math.min(1, deltaMs * 0.006));
  }
}
