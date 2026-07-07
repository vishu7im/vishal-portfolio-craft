// Minimal ordered pub/sub, ported from folio-2025 `sources/Game/Events.js`
// (MIT © 2025 Bruno Simon) and typed. Listeners register with an integer
// `order`; on `trigger`, callbacks fire ascending by order so a frame's
// reactions are deterministic regardless of registration sequence.
//
// This is the composable primitive the reference threads through its Ticker,
// Inputs and Cycles. We introduce it here (Phase 1) as the foundation for the
// later input-action, cycles and collision-feedback phases. See
// docs/REDESIGN_ROADMAP.md.

export type EventCallback = (...args: unknown[]) => void;

export class Events {
  /** callbacks[name][order] → callback[]. Sparse arrays, iterated ascending. */
  private callbacks: Record<string, Array<EventCallback[]>> = {};

  on(name: string, callback: EventCallback, order = 1): this {
    if (!Array.isArray(this.callbacks[name])) this.callbacks[name] = [];
    if (!Array.isArray(this.callbacks[name][order])) this.callbacks[name][order] = [];
    this.callbacks[name][order].push(callback);
    return this;
  }

  off(name: string, callback: EventCallback | null = null): this {
    if (typeof callback === "function") {
      const orders = this.callbacks[name];
      if (!orders) return this;
      for (const bucket of orders) {
        if (!bucket) continue;
        const index = bucket.indexOf(callback);
        if (index !== -1) bucket.splice(index, 1);
      }
    } else {
      delete this.callbacks[name];
    }
    return this;
  }

  trigger(name: string, args: unknown[] = []): this {
    const orders = this.callbacks[name];
    if (!Array.isArray(orders)) return this;
    for (const bucket of orders) {
      if (!bucket) continue;
      // Copy so a listener that removes itself mid-trigger can't skip a sibling.
      for (const callback of bucket.slice()) callback.apply(this, args);
    }
    return this;
  }
}
