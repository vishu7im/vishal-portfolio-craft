import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import { frame } from "../state/gameStore";
import type { CarController } from "./CarController";

// Persistent tire marks stamped at the rear wheels while drifting. A capped
// ring buffer of recycled images keeps memory flat while giving a long,
// naturally-fading skid trail.

export class TireMarks {
  private scene: Phaser.Scene;
  private marks: Phaser.GameObjects.Image[] = [];
  private cursor = 0;
  private cap = TUNING.tireMarkCap;
  private lastX = 0;
  private lastY = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private stamp(x: number, y: number, angle: number, alpha: number) {
    let img: Phaser.GameObjects.Image;
    if (this.marks.length < this.cap) {
      img = this.scene.add.image(x, y, "tiremark").setDepth(3);
      this.marks.push(img);
    } else {
      img = this.marks[this.cursor];
      img.setPosition(x, y).setVisible(true);
      this.cursor = (this.cursor + 1) % this.cap;
    }
    img.setRotation(angle + Math.PI / 2);
    img.setAlpha(alpha);
    img.setScale(0.9, 1.15);
  }

  /** wheelspin marks while doing a stationary burnout (jittered so they pile up) */
  burnout(car: CarController) {
    const [x1, y1, x2, y2] = car.rearWheels();
    const j = () => Phaser.Math.FloatBetween(-2.5, 2.5);
    this.stamp(x1 + j(), y1 + j(), car.angle, 0.3);
    this.stamp(x2 + j(), y2 + j(), car.angle, 0.3);
  }

  update(car: CarController) {
    // lateral slip (handbrake or hard drift) leaves marks; require some travel.
    // Loose dirt scuffs sooner, so the threshold drops when off-road.
    const thresh = frame.onDirt ? TUNING.driftMarkThresholdDirt : TUNING.driftMarkThreshold;
    if (!car.drifting || car.lateralSlip < thresh) return;
    const moved = Math.hypot(car.x - this.lastX, car.y - this.lastY);
    if (moved < 9) return;
    this.lastX = car.x;
    this.lastY = car.y;
    const [x1, y1, x2, y2] = car.rearWheels();
    const alpha = Phaser.Math.Clamp(0.22 + car.driftLoad * 0.32, 0.22, 0.5);
    this.stamp(x1, y1, car.angle, alpha);
    this.stamp(x2, y2, car.angle, alpha);
  }
}
