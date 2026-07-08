import Phaser from "phaser";
import { TUNING } from "../config/tuning";
import { gameStore } from "../state/gameStore";

// Global time-scale — the single source of truth for bullet-time (docs/
// REDESIGN_ROADMAP.md, Phase 6). The reference (folio-2025) ramps its whole
// ticker's scale on hard hits; we mirror that with one value the scene applies
// to both the Matter engine (position integration) and the per-frame delta it
// hands the update pipeline, so physics, camera and animation slow together
// from one place — nothing can desync.
//
// A hard collision calls hit(strength); time dips toward bulletMinScale, holds
// briefly, then eases back to 1.0. An anti-spam cooldown keeps rapid bumps from
// machine-gunning the effect, and reduced-motion users are never slowed.

export class TimeScale {
  private current = 1;
  private holdMs = 0;
  private clock = 0; // accumulated real time (ms), for the cooldown
  private lastTriggerAt = -TUNING.bulletCooldownMs;

  /** Current time scale (1 = real time, <1 = slow-mo). */
  get scale() {
    return this.current;
  }

  /** True while time is meaningfully slowed (HUD/vignette can react). */
  get active() {
    return this.current < 0.98;
  }

  /**
   * Trigger a brief slow-mo. `strength` (0..1) scales both how deep time dips
   * and how long it holds. Ignored under reduced-motion, during the cooldown,
   * or when it would only weaken an already-deeper dip.
   */
  hit(strength: number) {
    if (gameStore.getState().reducedMotion) return;
    if (this.clock - this.lastTriggerAt < TUNING.bulletCooldownMs) return;
    const s = Phaser.Math.Clamp(strength, 0, 1);
    if (s <= 0) return;
    const depth = Phaser.Math.Linear(1, TUNING.bulletMinScale, s);
    if (depth >= this.current) return; // don't lift an active, deeper dip
    this.current = depth;
    this.holdMs = TUNING.bulletHoldMs * (0.5 + s * 0.5);
    this.lastTriggerAt = this.clock;
  }

  /** Advance in REAL time (unscaled) so the effect lasts a fixed wall-clock span. */
  update(realDeltaMs: number) {
    this.clock += realDeltaMs;
    if (this.current >= 1) return;
    if (this.holdMs > 0) {
      this.holdMs -= realDeltaMs;
      return;
    }
    const k = 1 - Math.exp(-TUNING.bulletRecover * (realDeltaMs / 1000));
    this.current += (1 - this.current) * k;
    if (this.current > 0.995) this.current = 1;
  }
}
