import Phaser from "phaser";
import type { PortfolioAnchor } from "../types";
import { hex } from "../config/palette";
import { TUNING } from "../config/tuning";

// The world reacts as you approach: buildings light up, screens turn on,
// holograms boot. Implemented as an accent-tinted glow that swells with
// proximity — independent of the side panel, so the world feels alive even if
// you never press E.

interface Entry {
  anchor: PortfolioAnchor;
  glow: Phaser.GameObjects.Image;
  accentColor: number;
  reaction: string;
  base: number; // glow base scale
}

export class ReactivitySystem {
  private entries: Entry[] = [];

  constructor(scene: Phaser.Scene, anchors: PortfolioAnchor[], accentFor: (a: PortfolioAnchor) => string) {
    for (const anchor of anchors) {
      if (!anchor.building) continue;
      const accentColor = hex(accentFor(anchor));
      const size = anchor.building.reaction === "hologram" ? 3.2 : 2.4;
      const glow = scene.add
        .image(anchor.x, anchor.y - 10, "glow")
        .setTint(accentColor)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0)
        .setScale(size)
        .setDepth(10 + anchor.y - 6);
      this.entries.push({
        anchor,
        glow,
        accentColor,
        reaction: anchor.building.reaction,
        base: size,
      });
    }
  }

  update(carX: number, carY: number, time: number) {
    for (const e of this.entries) {
      const d = Math.hypot(carX - e.anchor.x, carY - e.anchor.y);
      const t = Phaser.Math.Clamp(1 - (d - e.anchor.radius) / (TUNING.reactionRadius - e.anchor.radius), 0, 1);
      const pulse = e.reaction === "hologram" || e.reaction === "screens-on" ? 0.12 * Math.sin(time * 0.006) : 0;
      e.glow.setAlpha(t * (0.75 + pulse));
      e.glow.setScale(e.base * (0.85 + t * 0.35 + pulse));
    }
  }
}
