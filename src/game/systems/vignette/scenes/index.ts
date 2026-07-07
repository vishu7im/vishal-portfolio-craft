// Barrel of all vignette scene factories, grouped by theme. The coordinator
// (WorldVignetteSystem) wires these into the world; each factory takes a
// VignetteKit and returns a Vignette. Split out in Phase 2.
export { createAiLab, createAiTrainingArea, createDataPipelineRiver, createVoiceAiDemo, createDatabaseVault } from "./aiData";
export { createProductionIncident, createDevOpsFactory, createApiHighway, createBroadcastQueue } from "./ops";
export { createOpenSourcePark, createAchievementMountain, createCareerTrain, createResumeMuseum, createSkillTemple } from "./career";
export { createBugSwamp, createHotelBooking, createReconciliation, createSecret } from "./misc";
