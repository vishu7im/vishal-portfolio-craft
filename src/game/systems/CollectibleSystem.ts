import Phaser from "phaser";
import toast from "react-hot-toast";
import type { CollectibleDef } from "../types";
import { gameStore } from "../state/gameStore";
import { TEX_SS } from "../art/textureFactory";
import { TUNING } from "../config/tuning";
import type { AudioSystem } from "./AudioSystem";

// Floating, spinning collectibles. Already-collected ones (from the save) are
// skipped at build time. Pickup = pop tween + sparkle + ding.

interface Live {
  def: CollectibleDef;
  img: Phaser.GameObjects.Image;
}

const KIND_LABEL: Record<string, string> = {
  chip: "Computer chip",
  "ai-core": "AI core",
  keyboard: "Golden keyboard",
  duck: "Rubber duck",
};

export class CollectibleSystem {
  private scene: Phaser.Scene;
  private audio: AudioSystem;
  private live: Live[] = [];
  private sparkle: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, defs: CollectibleDef[], audio: AudioSystem) {
    this.scene = scene;
    this.audio = audio;

    this.sparkle = scene.add
      .particles(0, 0, "sparkle", {
        speed: { min: 40, max: 140 },
        scale: { start: 0.7, end: 0 },
        lifespan: 500,
        quantity: 10,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);

    for (const def of defs) {
      if (gameStore.isCollected(def.id)) continue;
      const img = scene.add
        .image(def.x, def.y, `col-${def.kind}`)
        .setScale(1 / TEX_SS)
        .setDepth(10 + def.y + 40);
      // gentle bob + spin
      scene.tweens.add({
        targets: img,
        y: def.y - 8,
        duration: 900 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      scene.tweens.add({
        targets: img,
        scaleX: { from: 1 / TEX_SS, to: -1 / TEX_SS },
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });
      this.live.push({ def, img });
    }
  }

  update(carX: number, carY: number) {
    for (let i = this.live.length - 1; i >= 0; i--) {
      const { def, img } = this.live[i];
      if (Math.hypot(carX - def.x, carY - def.y) > TUNING.collectRadius) continue;
      this.live.splice(i, 1);
      gameStore.collect(def.id, def.value);
      this.sparkle.emitParticleAt(def.x, def.y);
      this.audio.ding(def.secret ? 1.5 : 1);
      this.scene.tweens.add({
        targets: img,
        scale: 0,
        y: def.y - 30,
        alpha: 0,
        duration: 260,
        ease: "Back.in",
        onComplete: () => img.destroy(),
      });
      if (def.secret && KIND_LABEL[def.kind]) {
        toast(`✨ Found a secret ${KIND_LABEL[def.kind]}! +${def.value}`);
      }
    }
  }
}
