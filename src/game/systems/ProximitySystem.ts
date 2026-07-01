import type { PortfolioAnchor } from "../types";
import { gameStore } from "../state/gameStore";

// Finds the nearest portfolio anchor within its activation radius and publishes
// it to the store (which drives the React "Press E" hint). Fires only on change.

export class ProximitySystem {
  private anchors: PortfolioAnchor[];
  near: PortfolioAnchor | null = null;

  constructor(anchors: PortfolioAnchor[]) {
    this.anchors = anchors;
  }

  update(x: number, y: number) {
    let best: PortfolioAnchor | null = null;
    let bestD = Infinity;
    for (const a of this.anchors) {
      const d = Math.hypot(x - a.x, y - a.y);
      if (d < a.radius && d < bestD) {
        bestD = d;
        best = a;
      }
    }
    this.near = best;
    gameStore.setNear(best?.id ?? null, best?.label ?? null);
  }
}
