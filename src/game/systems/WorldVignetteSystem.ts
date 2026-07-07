import Phaser from "phaser";
import { VignetteKit, type Vignette } from "./vignette/VignetteKit";
import {
  createAiLab,
  createProductionIncident,
  createDevOpsFactory,
  createBugSwamp,
  createOpenSourcePark,
  createAiTrainingArea,
  createDataPipelineRiver,
  createApiHighway,
  createAchievementMountain,
  createCareerTrain,
  createResumeMuseum,
  createSkillTemple,
  createVoiceAiDemo,
  createDatabaseVault,
  createHotelBooking,
  createBroadcastQueue,
  createReconciliation,
  createSecret,
} from "./vignette/scenes";

// Coordinator for the world "vignettes" — the ~20 animated dioramas that bloom
// as you drive near portfolio anchors. The drawing/animation of each lives in
// vignette/scenes/*; the shared drawing helpers, constants and particle
// emitters live in vignette/VignetteKit. This file just builds them and ticks
// them. (Was a single 1300-line class before the Phase 2 split.)
export class WorldVignetteSystem {
  private readonly kit: VignetteKit;
  private readonly vignettes: Vignette[] = [];

  constructor(scene: Phaser.Scene) {
    const k = new VignetteKit(scene);
    this.kit = k;

    this.vignettes.push(
      createAiLab(k),
      createProductionIncident(k),
      createDevOpsFactory(k),
      createBugSwamp(k),
      createOpenSourcePark(k),
      createAiTrainingArea(k),
      createDataPipelineRiver(k),
      createApiHighway(k),
      createAchievementMountain(k),
      createCareerTrain(k),
      createResumeMuseum(k),
      createSkillTemple(k),
      createVoiceAiDemo(k),
      createDatabaseVault(k),
      createHotelBooking(k),
      createBroadcastQueue(k),
      createReconciliation(k),
      createSecret(k, "ai-bunker", 2450, 6900, "Hidden AI Bunker", "Tool-use agents hum below the lab floor.", 0x7b5cff),
      createSecret(k, "github-cave", 7250, 6180, "Secret GitHub Cave", "Old branches, useful scripts, and hard-earned fixes.", 0x4ce0a0),
      createSecret(k, "prototype-arcade", 8500, 4500, "Old 8-bit Prototype", "First portfolio build unlocked in the arcade cabinet.", 0xf2b843)
    );
  }

  update(carX: number, carY: number, time: number, delta: number) {
    const ctx = { carX, carY, time, delta };
    for (const v of this.vignettes) v.update(ctx);
  }

  destroy() {
    for (const v of this.vignettes) v.destroy?.();
    this.kit.destroyParticles();
  }
}
