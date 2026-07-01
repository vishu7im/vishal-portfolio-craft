import Phaser from "phaser";
import { buildGroundTextures, buildAreaGround } from "../art/ground";
import { buildVehicleTextures } from "../art/vehicles";
import { buildPropTextures } from "../art/props";
import { buildCollectibleTextures } from "../art/collectibles";

// Bakes every code-authored texture once, then hands off to the world. The
// React LoadingVeil covers this brief gap.

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
