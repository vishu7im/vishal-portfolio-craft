import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { WorldScene } from "./scenes/WorldScene";
import { PALETTE } from "./config/palette";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: PALETTE.paper,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    },
    render: {
      antialias: true,
      roundPixels: true,
      powerPreference: "high-performance",
    },
    physics: {
      default: "matter",
      matter: {
        gravity: { x: 0, y: 0 },
        // debug: { showBody: true, showStaticBody: true },
      },
    },
    scene: [BootScene, WorldScene],
  });
}
