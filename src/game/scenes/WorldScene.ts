import Phaser from "phaser";
import { WORLD, areaAt } from "../world";
import { PROP_SPECS } from "../art/props";
import { TEX_SS } from "../art/textureFactory";
import { PALETTE, hex, type AreaId } from "../config/palette";
import { TUNING, VEHICLES, DEFAULT_VEHICLE } from "../config/tuning";
import { DEV_JOKES } from "../content/narrative";
import type { PropInstance, PortfolioAnchor } from "../types";
import { carInput, installInputListeners } from "../state/input";
import { mulberry32 } from "../world/scatter";
import { gameStore, frame } from "../state/gameStore";
import { CarController } from "../systems/CarController";
import { CameraRig } from "../systems/CameraRig";
import { TireMarks } from "../systems/TireMarks";
import { CarFxSystem } from "../systems/CarFxSystem";
import { isOnDirt } from "../world/roads";
import { ProximitySystem } from "../systems/ProximitySystem";
import { CollectibleSystem } from "../systems/CollectibleSystem";
import { MissionManager } from "../systems/MissionManager";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { ReactivitySystem } from "../systems/ReactivitySystem";
import { DestructionSystem } from "../systems/DestructionSystem";
import { AudioSystem } from "../systems/AudioSystem";
import { WorldVignetteSystem } from "../systems/WorldVignetteSystem";
import { AmbientWorldSystem } from "../systems/AmbientWorldSystem";
import { AchievementSystem } from "../systems/AchievementSystem";
import { DayNightSystem } from "../systems/DayNightSystem";
import { ScreenDisplaySystem } from "../systems/ScreenDisplaySystem";
import {
  ORDER,
  orderedPipeline,
  type SystemStep,
  type FrameContext,
} from "../core/systemOrder";

export class WorldScene extends Phaser.Scene {
  private car!: CarController;
  private rig!: CameraRig;
  private tire!: TireMarks;
  private carFx!: CarFxSystem;
  private proximity!: ProximitySystem;
  private collectibles!: CollectibleSystem;
  private mission!: MissionManager;
  private progression!: ProgressionSystem;
  private reactivity!: ReactivitySystem;
  private destruction!: DestructionSystem;
  private vignettes!: WorldVignetteSystem;
  private ambient!: AmbientWorldSystem;
  private achievements!: AchievementSystem;
  private dayNight!: DayNightSystem;
  private opsScreens!: ScreenDisplaySystem;
  private audio!: AudioSystem;

  private pipeline: SystemStep[] = [];

  private removeInput: () => void = () => {};
  private unsub: () => void = () => {};
  private lastMuted = gameStore.getState().muted;
  private lastArea: AreaId | null = null;
  private jokeIx = 0;
  private gateZoomed = false;
  private screechAt = 0;

  constructor() {
    super("World");
  }

  create() {
    const W = WORLD.bounds.w;
    const H = WORLD.bounds.h;

    this.matter.world.setBounds(0, 0, W, H, 200);
    this.matter.world.setGravity(0, 0);
    this.cameras.main.setBackgroundColor(PALETTE.paper);

    // --- ground, area patches, roads ---
    this.add.tileSprite(0, 0, W, H, "ground").setOrigin(0).setDepth(0);
    for (const area of WORLD.areas) {
      this.add
        .image(area.center.x, area.center.y, `aground-${area.id}`)
        .setDisplaySize(area.footprint.w * 1.3, area.footprint.h * 1.3)
        .setDepth(1);
    }
    this.drawRoads();

    // --- audio (started on first gesture) ---
    this.audio = new AudioSystem();
    this.destruction = new DestructionSystem(this, this.audio);

    // --- props ---
    for (const inst of WORLD.props) this.placeProp(inst);

    // --- anchors: buildings + reactivity glow ---
    for (const a of WORLD.anchors) {
      if (a.building) {
        this.placeProp({
          id: `${a.id}-building`,
          kind: a.building.kind,
          x: a.x,
          y: a.y,
          scale: a.building.scale ?? 1,
          physics: "static",
        });
      }
    }
    const accentFor = (a: PortfolioAnchor) =>
      WORLD.areas.find((ar) => ar.id === a.areaId)?.palette.accent ?? PALETTE.area.city.accent;
    this.reactivity = new ReactivitySystem(this, WORLD.anchors, accentFor);
    this.vignettes = new WorldVignetteSystem(this);
    this.opsScreens = new ScreenDisplaySystem(this);

    // --- car + camera ---
    const s = WORLD.spawn;
    this.car = new CarController(this, s.x, s.y, s.angle, VEHICLES[DEFAULT_VEHICLE]);
    this.rig = new CameraRig(this, this.car, W, H);
    this.dayNight = new DayNightSystem(this);
    this.ambient = new AmbientWorldSystem(this, this.car, this.dayNight, this.audio);

    // --- systems that depend on car ---
    this.tire = new TireMarks(this);
    this.carFx = new CarFxSystem(this, this.car, this.rig, this.tire, this.dayNight);
    this.proximity = new ProximitySystem(WORLD.anchors);
    this.collectibles = new CollectibleSystem(this, WORLD.collectibles, this.audio);
    this.mission = new MissionManager(this, this.car, this.audio);
    this.mission.setCameraRig(this.rig);
    this.progression = new ProgressionSystem(this.car);
    this.achievements = new AchievementSystem(this, this.car, this.audio);

    // --- input + collisions ---
    this.removeInput = installInputListeners();
    this.matter.world.on("collisionstart", this.onCollisionStart, this);
    this.input.keyboard?.on("keydown", this.ensureAudio, this);
    this.input.on("pointerdown", this.ensureAudio, this);

    this.unsub = gameStore.subscribe(() => {
      const m = gameStore.getState().muted;
      if (m !== this.lastMuted) {
        this.lastMuted = m;
        this.audio.setMuted(m);
      }
    });

    // Freeze the per-frame system order into an explicit registry (see
    // core/systemOrder.ts). Built once here now that every system exists.
    this.pipeline = this.buildPipeline();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.teardown, this);

    const area = areaAt(s.x, s.y);
    this.lastArea = area.id;
    gameStore.setArea(area.id);
    gameStore.setReady();
  }

  private ensureAudio() {
    if (gameStore.getState().audioStarted) return;
    gameStore.startAudio();
    const area = areaAt(this.car.x, this.car.y);
    this.audio.start(gameStore.getState().muted, area.audio);
  }

  private placeProp(inst: PropInstance) {
    const spec = PROP_SPECS[inst.kind];
    const scale = inst.scale ?? 1;
    const img = this.add
      .image(inst.x, inst.y, `prop-${inst.kind}`)
      .setRotation(inst.rotation ?? 0)
      .setScale(scale / TEX_SS);
    const baseY = inst.y + spec.h * scale * 0.4;
    img.setDepth(10 + baseY);
    img.setData("kind", inst.kind);
    img.setData("physics", inst.physics);

    if (inst.physics === "decor") {
      this.matter.add.gameObject(img, {
        shape: { type: "circle", radius: spec.w * scale * 0.4 },
        isStatic: true,
        isSensor: true,
      });
    } else if (spec.body.shape !== "none") {
      const shape =
        spec.body.shape === "circle"
          ? { type: "circle", radius: spec.w * scale * (spec.body.r ?? 0.4) }
          : {
              type: "rectangle",
              width: spec.w * scale * (spec.body.w ?? 0.8),
              height: spec.h * scale * (spec.body.h ?? 0.8),
            };
      const dynamic = inst.physics === "destructible" || inst.physics === "pushable";
      this.matter.add.gameObject(img, {
        shape: shape as Phaser.Types.Physics.Matter.MatterSetBodyConfig,
        isStatic: !dynamic,
        frictionAir: 0.1,
        friction: 0.15,
        restitution: 0.35,
        mass: inst.physics === "pushable" ? (inst.kind === "cone" ? 0.25 : 0.5) : 3,
      });
    }

    if (inst.kind === "sign") {
      const joke = DEV_JOKES[this.jokeIx++ % DEV_JOKES.length];
      this.add
        .text(inst.x, inst.y - 40 * scale, joke, {
          fontFamily: "ui-monospace, monospace",
          fontSize: "12px",
          color: "#3a4048",
          align: "center",
          wordWrap: { width: 150 },
          backgroundColor: "rgba(244,237,224,0.75)",
        })
        .setOrigin(0.5, 1)
        .setPadding(4, 2, 4, 2)
        .setDepth(10 + baseY + 1);
    }

    return img;
  }

  private drawRoads() {
    const g = this.add.graphics().setDepth(2);
    const surfaceOf = (kind: string) =>
      kind === "dirt"
        ? 0xb79366
        : kind === "boardwalk"
          ? 0xc39a63
          : kind === "bridge"
            ? 0xcfae7c
            : kind === "neon"
              ? 0x2a303b
              : hex(PALETTE.road);
    for (const road of WORLD.roads) {
      const surface = surfaceOf(road.kind);
      const half = road.width / 2;
      const pts = road.points;

      // bridges cast a soft shadow onto the water below the deck
      if (road.kind === "bridge") {
        g.lineStyle(road.width + 22, 0x20242c, 0.16);
        for (let i = 0; i < pts.length - 1; i++) {
          g.beginPath();
          g.moveTo(pts[i].x, pts[i].y + 12);
          g.lineTo(pts[i + 1].x, pts[i + 1].y + 12);
          g.strokePath();
        }
      }

      g.fillStyle(surface, 1);
      g.lineStyle(road.width, surface, 1);
      for (let i = 0; i < pts.length - 1; i++) {
        g.beginPath();
        g.moveTo(pts[i].x, pts[i].y);
        g.lineTo(pts[i + 1].x, pts[i + 1].y);
        g.strokePath();
      }
      // round the joints
      for (const p of pts) g.fillCircle(p.x, p.y, half);

      // per-kind markings — gold centre dashes on the Career Road spine
      if (road.kind === "asphalt") {
        this.dashLine(g, pts, road.spine ? 0xf2b843 : hex(PALETTE.roadLine));
        this.edgeLines(g, pts, road.width, hex(PALETTE.roadLine), 4, 0.5, 10);
      } else if (road.kind === "boardwalk") {
        this.plankLines(g, pts, road.width);
      } else if (road.kind === "bridge") {
        this.plankLines(g, pts, road.width);
        this.edgeLines(g, pts, road.width, 0x6e4a2f, 5, 0.9, 4); // railings
      } else if (road.kind === "neon") {
        this.dashLine(g, pts, 0x67e8f9);
        this.edgeLines(g, pts, road.width, 0x8c7cff, 4, 0.75, 8);
      } else if (road.kind === "dirt") {
        this.dirtSpecks(g, pts, road.width);
      }
    }
  }

  /** two thin lines inset from each road edge (highway edges / bridge rails) */
  private edgeLines(
    g: Phaser.GameObjects.Graphics,
    pts: Array<{ x: number; y: number }>,
    width: number,
    color: number,
    lineW: number,
    alpha: number,
    inset: number
  ) {
    g.lineStyle(lineW, color, alpha);
    const half = width / 2 - inset;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const nx = -(b.y - a.y) / len;
      const ny = (b.x - a.x) / len;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(a.x + nx * half * s, a.y + ny * half * s);
        g.lineTo(b.x + nx * half * s, b.y + ny * half * s);
        g.strokePath();
      }
    }
  }

  /** scattered darker specks + short ruts so dirt reads as dirt at speed */
  private dirtSpecks(
    g: Phaser.GameObjects.Graphics,
    pts: Array<{ x: number; y: number }>,
    width: number
  ) {
    const rng = mulberry32(Math.round(pts[0].x + pts[0].y * 7));
    g.fillStyle(0x9a7a50, 0.5);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const nx = -uy;
      const ny = ux;
      for (let d = 14; d < len; d += 26) {
        const lat = (rng() - 0.5) * width * 0.66;
        const x = a.x + ux * d + nx * lat;
        const y = a.y + uy * d + ny * lat;
        g.fillCircle(x, y, 1.5 + rng() * 1.6);
      }
    }
  }

  private dashLine(g: Phaser.GameObjects.Graphics, pts: Array<{ x: number; y: number }>, color: number) {
    g.lineStyle(6, color, 0.85);
    const dash = 34;
    const gap = 30;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      let d = 0;
      while (d < len) {
        const d2 = Math.min(len, d + dash);
        g.beginPath();
        g.moveTo(a.x + ux * d, a.y + uy * d);
        g.lineTo(a.x + ux * d2, a.y + uy * d2);
        g.strokePath();
        d += dash + gap;
      }
    }
  }

  private plankLines(g: Phaser.GameObjects.Graphics, pts: Array<{ x: number; y: number }>, width: number) {
    g.lineStyle(3, 0x9a6b3f, 0.6);
    const half = width / 2;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      const ux = (b.x - a.x) / len;
      const uy = (b.y - a.y) / len;
      const nx = -uy;
      const ny = ux;
      for (let d = 24; d < len; d += 40) {
        const cx = a.x + ux * d;
        const cy = a.y + uy * d;
        g.beginPath();
        g.moveTo(cx - nx * half, cy - ny * half);
        g.lineTo(cx + nx * half, cy + ny * half);
        g.strokePath();
      }
    }
  }

  private carSpeedPx() {
    const v = this.car.body.body.velocity;
    return Math.hypot(v.x, v.y);
  }

  private onCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    for (const pair of event.pairs) {
      const a = pair.bodyA as MatterJS.BodyType & { gameObject?: Phaser.GameObjects.GameObject };
      const b = pair.bodyB as MatterJS.BodyType & { gameObject?: Phaser.GameObjects.GameObject };
      let other: (Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform) | null = null;
      if (a.gameObject === this.car.body) other = b.gameObject as never;
      else if (b.gameObject === this.car.body) other = a.gameObject as never;
      else continue;
      if (!other || !("getData" in other)) continue;

      const kind = (other as Phaser.GameObjects.Image).getData("kind");
      const physics = (other as Phaser.GameObjects.Image).getData("physics");
      if (!kind || (other as Phaser.GameObjects.Image).getData("destroyed")) continue;
      const impact = this.carSpeedPx();

      if (physics === "decor") {
        if (kind === "bush") this.destruction.bushRustle(other.x, other.y);
        else if (kind === "puddle") this.destruction.puddleSplash(other.x, other.y);
        else if (kind === "ramp") this.car.hop();
        else if (kind === "boost") {
          this.car.boost();
          this.destruction.boostBurst(other.x, other.y);
        }
        continue;
      }
      if (physics === "destructible") {
        if (impact > TUNING.destroySpeedThreshold) {
          const blasted = this.destruction.smash(other as Phaser.GameObjects.Image, impact);
          if (blasted) this.car.flipFromCollision(impact, other.x, other.y);
        } else {
          this.destruction.thud(other.x, other.y, impact);
        }
        continue;
      }
      if (physics === "pushable") {
        this.destruction.thud(other.x, other.y, impact * 0.5);
        if (impact > TUNING.crashSpeedThreshold) this.car.onCollision(impact, other.x, other.y);
        continue;
      }
      // solid static
      if (kind === "lamp" && impact > 1.6) this.ambient.onLampHit(other as Phaser.GameObjects.Image);
      if (impact > TUNING.crashSpeedThreshold) {
        this.destruction.thud(other.x, other.y, impact);
        this.car.onCollision(impact, other.x, other.y);
      }
    }
  }

  update(time: number, delta: number) {
    if (!this.car) return;
    const ctx: FrameContext = { time, delta };
    for (const step of this.pipeline) step.run(ctx);
  }

  /**
   * Build the ordered per-frame pipeline. Each step is registered with a named
   * priority from core/systemOrder.ts and executed ascending, so the frame
   * order lives in one visible, tunable place. This encodes the historical
   * order 1:1 — no behavior change from the previous inline `update()`.
   */
  private buildPipeline(): SystemStep[] {
    const steps: SystemStep[] = [
      {
        order: ORDER.VEHICLE,
        label: "vehicle",
        run: ({ delta }) => {
          frame.onDirt = isOnDirt(this.car.x, this.car.y);
          this.car.surfaceRumble = frame.onDirt ? 1 : 0;
          this.car.update(carInput, delta);
        },
      },
      {
        order: ORDER.CAMERA,
        label: "camera",
        run: ({ delta }) => this.rig.update(delta),
      },
      {
        order: ORDER.TIRE,
        label: "tire",
        run: () => this.tire.update(this.car),
      },
      {
        order: ORDER.CAR_FX,
        label: "car-fx",
        run: ({ time, delta }) => this.carFx.update(time, delta),
      },
      {
        order: ORDER.PROXIMITY,
        label: "proximity",
        run: () => {
          this.proximity.update(this.car.x, this.car.y);
          const nearAnchor = this.proximity.near;
          this.rig.setNearness(
            nearAnchor
              ? 1 -
                  Math.hypot(this.car.x - nearAnchor.x, this.car.y - nearAnchor.y) /
                    nearAnchor.radius
              : 0
          );
        },
      },
      {
        order: ORDER.INTERACT,
        label: "interact",
        run: () => this.handleInteractInput(),
      },
      {
        order: ORDER.BRAKE_SFX,
        label: "brake-sfx",
        run: ({ time }) => {
          // hard-braking tyre hush (one-shot, spaced so it never machine-guns)
          if (this.car.braking && this.car.speedNorm > 0.7 && time > this.screechAt) {
            this.screechAt = time + 1600;
            this.audio.screech(0.35 + this.car.speedNorm * 0.4);
          }
        },
      },
      {
        order: ORDER.COLLECTIBLES,
        label: "collectibles",
        run: () => this.collectibles.update(this.car.x, this.car.y),
      },
      {
        order: ORDER.MISSION,
        label: "mission",
        run: ({ time, delta }) => this.mission.update(delta, time),
      },
      {
        order: ORDER.PROGRESSION,
        label: "progression",
        run: () => this.progression.update(),
      },
      {
        order: ORDER.REACTIVITY,
        label: "reactivity",
        run: ({ time }) => this.reactivity.update(this.car.x, this.car.y, time),
      },
      {
        order: ORDER.VIGNETTE,
        label: "vignette",
        run: ({ time, delta }) => this.vignettes.update(this.car.x, this.car.y, time, delta),
      },
      {
        order: ORDER.AMBIENT,
        label: "ambient",
        run: ({ time, delta }) => this.ambient.update(time, delta),
      },
      {
        order: ORDER.DAY_NIGHT,
        label: "day-night",
        run: ({ delta }) => this.dayNight.update(delta),
      },
      {
        order: ORDER.SCREENS,
        label: "screens",
        run: ({ time }) => this.opsScreens.update(time),
      },
      {
        order: ORDER.AREA,
        label: "area-transition",
        run: () => this.handleAreaTransition(),
      },
      {
        order: ORDER.GATE,
        label: "gate-cinematic",
        run: () => this.handleGateCinematic(),
      },
      {
        order: ORDER.FAST_TRAVEL,
        label: "fast-travel",
        run: () => this.handleFastTravel(),
      },
      {
        order: ORDER.TELEMETRY,
        label: "telemetry",
        run: () => this.pushTelemetry(),
      },
      {
        order: ORDER.AUDIO,
        label: "audio",
        run: () => {
          if (gameStore.getState().audioStarted) {
            this.audio.update(
              this.car.rpm,
              carInput.throttle,
              this.car.driftLoad,
              this.carFx.burnoutActive
            );
          }
        },
      },
    ];
    return orderedPipeline(steps);
  }

  private handleInteractInput() {
    if (carInput.interact) {
      carInput.interact = false;
      if (this.proximity.near) gameStore.focus(this.proximity.near.id);
    }
    if (carInput.dismiss) {
      carInput.dismiss = false;
      if (gameStore.getState().focusedId) gameStore.focus(null);
      else if (gameStore.getState().achievementsOpen) gameStore.set({ achievementsOpen: false });
    }
    if (carInput.horn) {
      carInput.horn = false;
      this.ensureAudio();
      this.audio.horn();
      this.ambient.onHorn(this.car.x, this.car.y);
    }
  }

  private handleAreaTransition() {
    const area = areaAt(this.car.x, this.car.y);
    if (area.id !== this.lastArea) {
      this.lastArea = area.id;
      gameStore.setArea(area.id);
      if (gameStore.getState().audioStarted) this.audio.setArea(area.audio);
      // cinematic: first time entering the AI Research Lab
      if (area.id === "research-lab" && !gameStore.isCollected("cine-ai-lab")) {
        gameStore.collect("cine-ai-lab", 0);
        this.rig.zoomTo(1.18);
        this.audio.chord();
        this.time.delayedCall(2400, () => this.rig.zoomTo(null));
      }
    }
  }

  private handleGateCinematic() {
    // cinematic: the locked Future City gate pulls the camera in on approach
    const gateD = Math.hypot(this.car.x - 8900, this.car.y - 6600);
    if (gateD < 620 && !this.gateZoomed) {
      this.gateZoomed = true;
      this.rig.zoomTo(1.12);
    } else if (gateD >= 700 && this.gateZoomed) {
      this.gateZoomed = false;
      this.rig.zoomTo(null);
    }
  }

  private handleFastTravel() {
    // fast-travel request from the minimap
    if (frame.requestTravel) {
      const { x, y } = frame.requestTravel;
      frame.requestTravel = null;
      this.car.body.setPosition(x, y);
      this.car.body.setVelocity(0, 0);
      this.cameras.main.flash(320, 244, 237, 224);
    }
  }

  private pushTelemetry() {
    // telemetry → React (no re-render)
    frame.playerX = this.car.x;
    frame.playerY = this.car.y;
    frame.heading = this.car.angle;
    frame.speed = this.car.speedNorm;
    frame.rpm = this.car.rpm;
    frame.driftLoad = this.car.driftLoad;
    frame.nitro = this.car.nitroActive;
    frame.drifting = this.car.drifting;
    frame.braking = this.car.braking;
    frame.reversing = this.car.reversing;
  }

  private teardown() {
    this.removeInput();
    this.unsub();
    this.matter.world.off("collisionstart", this.onCollisionStart, this);
    this.carFx?.destroy();
    this.ambient?.destroy();
    this.vignettes?.destroy();
    this.achievements?.destroy();
    this.dayNight?.destroy();
    this.opsScreens?.destroy();
    this.audio?.dispose();
  }
}
