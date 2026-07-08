import Phaser from "phaser";
import type { PortfolioAnchor } from "../types";
import { gameStore } from "../state/gameStore";
import { hex, PALETTE } from "../config/palette";

// Floating "there's something here" markers over every portfolio anchor — a
// bobbing diamond + place-name chip that elastically reveals when the car drives
// near OR the pointer hovers it, then springs away. This is the reference's
// InteractivePoints affordance (`◇ + label`, revealed by proximity *and* hover
// with an elastic GSAP reveal) adapted to our 2D top-down world (docs/
// REDESIGN_ROADMAP.md, Phase 9). The React "Press E" pill stays the actual
// prompt; these markers are the discovery cue that rewards exploration.
//
// Markers sit above the day/night MULTIPLY tint so they stay legible after dark,
// and all hide while a panel is focused so the cinematic framing reads cleanly.

const MARKER_DEPTH = 95000;
const LABEL_OFFSET_Y = 74; // above the anchor's building
const HOVER_RADIUS = 96; // world px around an anchor the pointer must be within
const BOB = 3.5;

interface Marker {
  anchor: PortfolioAnchor;
  container: Phaser.GameObjects.Container;
  shown: boolean;
  revealTween?: Phaser.Tweens.Tween;
}

export class AnchorMarkers {
  private readonly scene: Phaser.Scene;
  private readonly markers: Marker[] = [];
  private readonly pointerWorld = new Phaser.Math.Vector2();

  constructor(
    scene: Phaser.Scene,
    anchors: PortfolioAnchor[],
    accentFor: (a: PortfolioAnchor) => string
  ) {
    this.scene = scene;
    const reduced = gameStore.getState().reducedMotion;
    for (const a of anchors) {
      const container = this.build(a, hex(accentFor(a)));
      this.markers.push({ anchor: a, container, shown: false });
      // idle bob for a touch of life (skipped for reduced-motion)
      if (!reduced) {
        scene.tweens.add({
          targets: container,
          y: container.y - BOB,
          duration: 1400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
          delay: (a.x % 700) * 0.8, // desync so they don't pulse in lockstep
        });
      }
    }
  }

  private build(a: PortfolioAnchor, accent: number): Phaser.GameObjects.Container {
    const scene = this.scene;
    const ink = hex(PALETTE.ink);

    const label = scene.add
      .text(0, 10, a.label, {
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        fontStyle: "600",
        fontSize: "14px",
        color: PALETTE.ink,
      })
      .setOrigin(0.5);

    const padX = 12;
    const padY = 7;
    const chip = scene.add
      .rectangle(0, 10, label.width + padX * 2, label.height + padY * 2, hex(PALETTE.paper), 0.97)
      .setStrokeStyle(1.5, ink, 0.16)
      .setOrigin(0.5);

    // diamond: accent square rotated 45°, ink outline, sitting above the chip
    const diamond = scene.add
      .rectangle(0, -18, 14, 14, accent)
      .setStrokeStyle(2.5, ink, 0.9)
      .setAngle(45);
    const diamondDot = scene.add.circle(0, -18, 2.4, hex(PALETTE.paper), 0.95);

    const container = scene.add
      .container(a.x, a.y - LABEL_OFFSET_Y, [chip, label, diamond, diamondDot])
      .setDepth(MARKER_DEPTH)
      .setScale(0)
      .setAlpha(0);
    return container;
  }

  update(carX: number, carY: number) {
    const focused = gameStore.getState().focusedId;
    const pointer = this.scene.input.activePointer;
    pointer.positionToCamera(this.scene.cameras.main, this.pointerWorld);

    for (const m of this.markers) {
      const a = m.anchor;
      const near = Math.hypot(carX - a.x, carY - a.y) < a.radius;
      const hover =
        pointer.active && Math.hypot(this.pointerWorld.x - a.x, this.pointerWorld.y - a.y) < HOVER_RADIUS;
      // hide everything while a panel is open so the cinematic framing is clean
      const shouldShow = !focused && (near || hover);
      if (shouldShow !== m.shown) this.setShown(m, shouldShow);
    }
  }

  private setShown(m: Marker, show: boolean) {
    m.shown = show;
    m.revealTween?.stop();
    const reduced = gameStore.getState().reducedMotion;
    m.revealTween = this.scene.tweens.add({
      targets: m.container,
      scale: show ? 1 : 0,
      alpha: show ? 1 : 0,
      duration: reduced ? 120 : show ? 520 : 220,
      ease: reduced ? "Linear" : show ? "Back.easeOut" : "Cubic.easeIn",
    });
  }

  destroy() {
    for (const m of this.markers) {
      m.revealTween?.stop();
      m.container.destroy();
    }
    this.markers.length = 0;
  }
}
