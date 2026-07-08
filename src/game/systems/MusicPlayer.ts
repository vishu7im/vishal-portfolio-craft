import { clamp } from "../core/maths";

// Streaming CC0 music jukebox (docs/REDESIGN_ROADMAP.md, Phase 7). The reference
// (folio-2025) plays grouped audio through a mixer with playRandomNext (cycles
// variants, never repeats back-to-back) and manual crossfades in Audio.update.
// We adopt that pattern for the three CC0 tracks it ships (musics/license.md is
// CC0): a two-deck crossfading player that streams each track via an
// HTMLAudioElement routed into the shared AudioContext through the music bus, so
// the global master gain / mute apply to it like everything else.
//
// Only the CC0 music is reused — every SFX stays synthesized in AudioSystem, our
// guaranteed-safe path (the reference's individual SFX are commercial-stock and
// not cleared for redistribution). See CREDITS.md.

const TRACKS = ["Boy", "Baguira", "Sudo"] as const;
const CROSSFADE_S = 3.5; // overlap when moving between tracks
const MUSIC_LEVEL = 0.32; // the music bus sits well under the SFX

interface Deck {
  el: HTMLAudioElement;
  gain: GainNode;
  index: number; // its slot (0 | 1), captured for the event closures
}

export class MusicPlayer {
  private ctx: AudioContext;
  private bus: GainNode;
  private decks: Deck[] = [];
  private active = 0; // which deck is currently foregrounded
  private order: number[] = []; // shuffled track queue
  private orderPos = 0;
  private lastPlayed = -1; // avoid an immediate repeat across reshuffles
  private started = false;
  private muted = false;
  private pendingFirst = false; // start()ed while muted → begin on first unmute
  private transitioning = false;
  private readonly base = import.meta.env.BASE_URL;

  constructor(ctx: AudioContext, bus: GainNode) {
    this.ctx = ctx;
    this.bus = bus;
    this.bus.gain.value = MUSIC_LEVEL;
  }

  /** Called on the first user gesture (same one that resumes the AudioContext). */
  start(muted: boolean) {
    if (this.started) return;
    this.started = true;
    this.muted = muted;
    this.decks = [this.makeDeck(0), this.makeDeck(1)];
    if (muted) this.pendingFirst = true;
    else this.beginFirst();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.started) return;
    if (muted) {
      // Pause both elements so a muted visitor never streams ~6 MB in the
      // background; the master gain already silences them, this just saves data.
      this.decks.forEach((d) => d.el.pause());
    } else if (this.pendingFirst) {
      this.pendingFirst = false;
      this.beginFirst();
    } else {
      const a = this.decks[this.active];
      a?.el.play().catch(() => {});
    }
  }

  /** Manual skip — crossfade straight to the next track. */
  next() {
    if (!this.started || this.muted) return;
    this.advance();
  }

  dispose() {
    this.decks.forEach((d) => {
      try {
        d.el.pause();
        d.el.src = "";
      } catch {
        /* noop */
      }
    });
    this.decks = [];
    this.started = false;
  }

  // --- internals ----------------------------------------------------------

  private urlFor(index: number) {
    return `${this.base}audio/music/${TRACKS[index]}.mp3`;
  }

  private makeDeck(index: number): Deck {
    const el = new Audio();
    el.preload = "none";
    const src = this.ctx.createMediaElementSource(el);
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    src.connect(gain).connect(this.bus);
    const deck: Deck = { el, gain, index };
    // Crossfade a little before the end; fall back to a hard advance on 'ended'.
    el.addEventListener("timeupdate", () => {
      if (this.decks[this.active] !== deck) return;
      const remaining = el.duration - el.currentTime;
      if (Number.isFinite(remaining) && remaining <= CROSSFADE_S) this.advance();
    });
    el.addEventListener("ended", () => {
      if (this.decks[this.active] === deck) this.advance();
    });
    return deck;
  }

  private nextIndex(): number {
    if (this.orderPos >= this.order.length) {
      const idx = TRACKS.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      // never open a fresh shuffle with the track that just finished
      if (idx.length > 1 && idx[0] === this.lastPlayed) [idx[0], idx[1]] = [idx[1], idx[0]];
      this.order = idx;
      this.orderPos = 0;
    }
    const n = this.order[this.orderPos++];
    this.lastPlayed = n;
    return n;
  }

  private beginFirst() {
    const deck = this.decks[this.active];
    deck.el.src = this.urlFor(this.nextIndex());
    deck.el.play().catch(() => {});
    const t = this.ctx.currentTime;
    deck.gain.gain.cancelScheduledValues(t);
    deck.gain.gain.setValueAtTime(0.0001, t);
    deck.gain.gain.linearRampToValueAtTime(1, t + CROSSFADE_S);
  }

  private advance() {
    if (this.transitioning || !this.started || this.muted) return;
    this.transitioning = true;
    const from = this.decks[this.active];
    const toSlot = 1 - this.active;
    const to = this.decks[toSlot];

    to.el.src = this.urlFor(this.nextIndex());
    to.el.currentTime = 0;
    to.el.play().catch(() => {});

    const t = this.ctx.currentTime;
    to.gain.gain.cancelScheduledValues(t);
    to.gain.gain.setValueAtTime(0.0001, t);
    to.gain.gain.linearRampToValueAtTime(1, t + CROSSFADE_S);
    from.gain.gain.cancelScheduledValues(t);
    from.gain.gain.setValueAtTime(clamp(from.gain.gain.value, 0.0001, 1), t);
    from.gain.gain.linearRampToValueAtTime(0.0001, t + CROSSFADE_S);

    this.active = toSlot;
    window.setTimeout(() => {
      from.el.pause();
      this.transitioning = false;
    }, (CROSSFADE_S + 0.25) * 1000);
  }
}
