import Phaser from "phaser";
import type { RandomEventDef } from "../types";
import { RANDOM_EVENTS } from "../content/randomEvents";
import { WORLD } from "../world";
import { frame, gameStore } from "../state/gameStore";
import type { CarController } from "./CarController";
import type { MissionManager } from "./MissionManager";
import type { AudioSystem } from "./AudioSystem";

// While free-roaming, the phone occasionally rings with a small timed job
// (PhoneCallCard renders the offer). Calls never interrupt: they only fire
// when no mission is running, no panel is open, and the player is actually
// driving — and never near a mission beacon, so they can't mask a mission start.

const FIRST_CALL_MS = 45000;
const COOLDOWN_MIN = 60000;
const COOLDOWN_MAX = 120000;
const RING_TIMEOUT = 10000;
const SPEED_GATE = 0.15;
const BEACON_CLEARANCE = 420;

export class PhoneCallSystem {
  private readonly car: CarController;
  private readonly mission: MissionManager;
  private readonly audio: AudioSystem;
  private nextCallAt = FIRST_CALL_MS;
  private ringingSince = -1;
  private lastRingTone = 0;
  private pool: RandomEventDef[] = [...RANDOM_EVENTS];

  constructor(car: CarController, mission: MissionManager, audio: AudioSystem) {
    this.car = car;
    this.mission = mission;
    this.audio = audio;
  }

  /** called from PhoneCallCard via the store: player accepted */
  accept() {
    const ev = gameStore.getState().phoneCall;
    if (!ev) return;
    gameStore.set({ phoneCall: null });
    this.ringingSince = -1;
    this.mission.startDynamic(ev);
  }

  decline() {
    const ev = gameStore.getState().phoneCall;
    if (ev) this.pool.push(ev); // back in the pool for later
    gameStore.set({ phoneCall: null });
    this.ringingSince = -1;
  }

  update(time: number) {
    const s = gameStore.getState();

    // answer requested from the React card (frame command channel)
    if (frame.phoneAnswer) {
      const answer = frame.phoneAnswer;
      frame.phoneAnswer = null;
      if (answer === "accept") this.accept();
      else this.decline();
      return;
    }

    // ring in progress: repeat the tone, auto-decline after the timeout
    if (s.phoneCall) {
      if (this.ringingSince < 0) this.ringingSince = time;
      if (time - this.lastRingTone > 2400) {
        this.lastRingTone = time;
        this.audio.ring();
      }
      if (time - this.ringingSince > RING_TIMEOUT) this.decline();
      return;
    }

    if (time < this.nextCallAt) return;
    // only offer a job while genuinely free-roaming
    if (s.activeMissionId || s.focusedId || s.garageOpen || s.achievementsOpen) return;
    if (this.car.speedNorm < SPEED_GATE) return;
    for (const m of WORLD.missions) {
      if (Math.hypot(this.car.x - m.giver.x, this.car.y - m.giver.y) < BEACON_CLEARANCE) return;
    }
    if (this.pool.length === 0) this.pool = [...RANDOM_EVENTS];

    const ix = Phaser.Math.Between(0, this.pool.length - 1);
    const [ev] = this.pool.splice(ix, 1);
    this.nextCallAt = time + Phaser.Math.Between(COOLDOWN_MIN, COOLDOWN_MAX);
    this.ringingSince = time;
    this.lastRingTone = time;
    this.audio.ring();
    gameStore.set({ phoneCall: ev });
  }
}
