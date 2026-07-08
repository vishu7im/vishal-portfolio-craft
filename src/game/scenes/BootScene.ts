import Phaser from "phaser";
import { buildGroundTextures, buildAreaGround } from "../art/ground";
import { buildVehicleTextures } from "../art/vehicles";
import { buildPropTextures } from "../art/props";
import { buildCollectibleTextures } from "../art/collectibles";

// Bakes every code-authored texture once, then hands off to the world. The
// React IntroOverlay covers this gap with a loading ring until the scene is
// ready, then shows the start prompt.

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  async create() {
    buildGroundTextures(this);
    buildAreaGround(this);
    await Promise.all([
      buildVehicleTextures(this),
      buildPropTextures(this),
      buildCollectibleTextures(this),
    ]);
    this.scene.start("World");
  }
}
