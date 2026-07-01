// Physics + pacing knobs. Per-vehicle configs live here so the unlockable cars
// differ by data alone. Matter units: force is tiny, velocity is px/step.

export interface VehicleTuning {
  key: string;
  name: string;
  blurb: string;
  driveForce: number; // forward thrust
  reverseForce: number;
  maxSpeed: number; // velocity magnitude clamp
  turnRate: number; // max angular velocity (rad/step)
  gripNormal: number; // fraction of lateral velocity REMOVED each step (bite)
  gripDrift: number; // reduced bite while handbraking (slide)
  drag: number; // longitudinal coast decay per step
  nitroMul: number; // multiplies drive force + max speed
  mass: number;
  bodyW: number;
  bodyH: number;
}

export const VEHICLES: Record<string, VehicleTuning> = {
  sports: {
    key: "sports", name: "Roadster", blurb: "Balanced all-rounder. Great first ride.",
    driveForce: 0.055, reverseForce: 0.03, maxSpeed: 11, turnRate: 0.058,
    gripNormal: 0.14, gripDrift: 0.03, drag: 0.992, nitroMul: 1.7, mass: 4.2, bodyW: 42, bodyH: 22,
  },
  electric: {
    key: "electric", name: "Volt", blurb: "Instant torque, sticky tyres, calmer top end.",
    driveForce: 0.066, reverseForce: 0.036, maxSpeed: 9.6, turnRate: 0.062,
    gripNormal: 0.2, gripDrift: 0.06, drag: 0.99, nitroMul: 1.6, mass: 3.6, bodyW: 40, bodyH: 22,
  },
  vintage: {
    key: "vintage", name: "Classic", blurb: "Heavy and loose — a lazy, characterful drifter.",
    driveForce: 0.042, reverseForce: 0.026, maxSpeed: 8.2, turnRate: 0.046,
    gripNormal: 0.1, gripDrift: 0.05, drag: 0.99, nitroMul: 1.5, mass: 6, bodyW: 44, bodyH: 24,
  },
  cyber: {
    key: "cyber", name: "Cyber", blurb: "Fast and razor-grippy. Rewards commitment.",
    driveForce: 0.062, reverseForce: 0.032, maxSpeed: 12.2, turnRate: 0.06,
    gripNormal: 0.16, gripDrift: 0.04, drag: 0.992, nitroMul: 1.8, mass: 4, bodyW: 42, bodyH: 22,
  },
  f1: {
    key: "f1", name: "Formula", blurb: "Blistering and twitchy. Slides at the limit.",
    driveForce: 0.078, reverseForce: 0.03, maxSpeed: 14.5, turnRate: 0.072,
    gripNormal: 0.12, gripDrift: 0.03, drag: 0.993, nitroMul: 1.9, mass: 3.2, bodyW: 48, bodyH: 20,
  },
  hover: {
    key: "hover", name: "Hover", blurb: "Frictionless and floaty. Pure momentum.",
    driveForce: 0.05, reverseForce: 0.03, maxSpeed: 11.8, turnRate: 0.05,
    gripNormal: 0.06, gripDrift: 0.02, drag: 0.995, nitroMul: 1.7, mass: 3, bodyW: 44, bodyH: 24,
  },
};

export const DEFAULT_VEHICLE = "sports";

// How each vehicle is earned. Coin-threshold unlocks are checked live; mission
// unlocks fire when the named mission completes.
export interface UnlockRule {
  vehicle: string;
  coins?: number;
  mission?: string;
  hint: string;
}

export const UNLOCKS: UnlockRule[] = [
  { vehicle: "electric", coins: 120, hint: "Collect 120 coins" },
  { vehicle: "vintage", mission: "deploy-release", hint: "Finish “Deploy the Release”" },
  { vehicle: "cyber", mission: "escape-memory-leak", hint: "Survive “Escape the Memory Leak”" },
  { vehicle: "f1", mission: "race-cicd", hint: "Win “Race the CI/CD Pipeline”" },
  { vehicle: "hover", coins: 500, hint: "Collect 500 coins" },
];

export const TUNING = {
  // camera
  camLerp: 0.08,
  camZoom: 1.0,
  camZoomNitro: 0.92,
  camShakeCrash: 0.006,
  // drift / marks
  driftMarkThreshold: 1.4, // lateral speed (px/step) before marks/smoke appear
  tireMarkCap: 700,
  // crash
  crashSpeedThreshold: 3.2,
  destroySpeedThreshold: 2.2,
  // proximity default
  anchorRadius: 150,
  reactionRadius: 320,
  collectRadius: 46,
} as const;
