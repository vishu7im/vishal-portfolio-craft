// Physics + pacing knobs. Per-vehicle configs live here so the unlockable cars
// differ by data alone. Matter units: force is tiny, velocity is px/step.

export interface VehicleTuning {
  key: string;
  name: string;
  blurb: string;
  driveForce: number; // forward thrust
  reverseForce: number;
  brakeForce: number;
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
    driveForce: 0.04, reverseForce: 0.022, brakeForce: 0.09, maxSpeed: 10.2, turnRate: 0.055,
    gripNormal: 0.42, gripDrift: 0.16, drag: 0.984, nitroMul: 1.55, mass: 5.1, bodyW: 42, bodyH: 22,
  },
  electric: {
    key: "electric", name: "Volt", blurb: "Instant torque, sticky tyres, calmer top end.",
    driveForce: 0.046, reverseForce: 0.024, brakeForce: 0.1, maxSpeed: 9.5, turnRate: 0.058,
    gripNormal: 0.52, gripDrift: 0.22, drag: 0.981, nitroMul: 1.5, mass: 4.8, bodyW: 40, bodyH: 22,
  },
  vintage: {
    key: "vintage", name: "Classic", blurb: "Heavy and loose — a lazy, characterful drifter.",
    driveForce: 0.032, reverseForce: 0.02, brakeForce: 0.08, maxSpeed: 8.4, turnRate: 0.044,
    gripNormal: 0.34, gripDrift: 0.13, drag: 0.983, nitroMul: 1.45, mass: 6.6, bodyW: 44, bodyH: 24,
  },
  cyber: {
    key: "cyber", name: "Cyber", blurb: "Fast and razor-grippy. Rewards commitment.",
    driveForce: 0.044, reverseForce: 0.023, brakeForce: 0.096, maxSpeed: 11.2, turnRate: 0.057,
    gripNormal: 0.48, gripDrift: 0.18, drag: 0.984, nitroMul: 1.65, mass: 5, bodyW: 42, bodyH: 22,
  },
  f1: {
    key: "f1", name: "Formula", blurb: "Blistering and twitchy. Slides at the limit.",
    driveForce: 0.056, reverseForce: 0.024, brakeForce: 0.11, maxSpeed: 12.8, turnRate: 0.066,
    gripNormal: 0.46, gripDrift: 0.14, drag: 0.986, nitroMul: 1.7, mass: 4.2, bodyW: 48, bodyH: 20,
  },
  hover: {
    key: "hover", name: "Hover", blurb: "Frictionless and floaty. Pure momentum.",
    driveForce: 0.036, reverseForce: 0.021, brakeForce: 0.075, maxSpeed: 10.8, turnRate: 0.049,
    gripNormal: 0.18, gripDrift: 0.06, drag: 0.99, nitroMul: 1.6, mass: 4.4, bodyW: 44, bodyH: 24,
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
  camLerp: 0.105,
  camZoom: 1.0,
  camZoomNitro: 0.88,
  camZoomSpeedRange: 0.12, // how far the view widens at top speed
  camZoomNear: 1.1, // slow-roll zoom-in beside a portfolio anchor
  camTiltDrift: 0.06, // rad (~3.4°) camera lean while drifting
  camShakeCrash: 0.006,
  // drift / marks
  driftMarkThreshold: 1.75, // lateral speed (px/step) before marks/smoke appear
  tireMarkCap: 700,
  // crash
  crashSpeedThreshold: 3.2,
  destroySpeedThreshold: 2.2,
  // proximity default
  anchorRadius: 150,
  reactionRadius: 320,
  collectRadius: 46,
} as const;
