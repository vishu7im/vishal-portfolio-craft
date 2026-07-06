import Phaser from "phaser";
import toast from "react-hot-toast";
import { ACHIEVEMENT_DEFS } from "../content/achievements";
import { gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";
import type { AudioSystem } from "./AudioSystem";

// Watches the store and unlocks declarative achievements; celebrates every
// unlock (including "custom" ones awarded imperatively elsewhere) with a
// toast, a chord and confetti at the car.

export class AchievementSystem {
  private readonly car: CarController;
  private readonly audio: AudioSystem;
  private readonly confetti: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly celebrated = new Set<string>();
  private readonly unsub: () => void;

  constructor(scene: Phaser.Scene, car: CarController, audio: AudioSystem) {
    this.car = car;
    this.audio = audio;
    this.confetti = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x4ce0a0, 0xf2b843, 0xf0813a, 0x7b5cff],
        speed: { min: 90, max: 260 },
        angle: { min: 230, max: 310 },
        gravityY: 160,
        scale: { start: 0.7, end: 0 },
        lifespan: 950,
        quantity: 24,
        emitting: false,
      })
      .setDepth(99999);

    // anything already unlocked in the save shouldn't re-celebrate
    for (const id of gameStore.getState().achievementsUnlocked) this.celebrated.add(id);
    this.unsub = gameStore.subscribe(() => this.evaluate());
    this.evaluate();
  }

  destroy() {
    this.unsub();
    this.confetti.destroy();
  }

  private evaluate() {
    const s = gameStore.getState();
    for (const def of ACHIEVEMENT_DEFS) {
      if (s.achievementsUnlocked.includes(def.id)) continue;
      const t = def.trigger;
      const met =
        (t.kind === "chapter" && s.chaptersVisited.includes(t.areaId)) ||
        (t.kind === "chapters" && s.chaptersVisited.length >= t.count) ||
        (t.kind === "mission" && s.missionsDone.includes(t.missionId)) ||
        (t.kind === "xp" && s.xp >= t.amount) ||
        (t.kind === "collectSet" && t.ids.every((id) => s.collected.includes(id))) ||
        (t.kind === "discoverSet" && t.ids.every((id) => s.discovered.includes(id)));
      if (met) gameStore.award(def.id);
    }
    // celebrate anything newly unlocked, by whatever path
    for (const id of gameStore.getState().achievementsUnlocked) {
      if (this.celebrated.has(id)) continue;
      this.celebrated.add(id);
      const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
      if (!def) continue;
      this.audio.chord();
      this.confetti.emitParticleAt(this.car.x, this.car.y - 60, 26);
      toast(`${def.icon} Achievement — ${def.title}`, { duration: 3600 });
    }
  }
}
