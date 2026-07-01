import Phaser from "phaser";
import { WORLD, areaAt } from "../world";
import { PROP_SPECS } from "../art/props";
import { TEX_SS } from "../art/textureFactory";
import { PALETTE, hex, type AreaId } from "../config/palette";
import { TUNING, VEHICLES, DEFAULT_VEHICLE } from "../config/tuning";
import { DEV_JOKES } from "../content/narrative";
import type { PropInstance, PortfolioAnchor } from "../types";
import { carInput, installInputListeners } from "../state/input";
import { gameStore, frame } from "../state/gameStore";
import { CarController } from "../systems/CarController";
import { CameraRig } from "../systems/CameraRig";
import { TireMarks } from "../systems/TireMarks";
import { ProximitySystem } from "../systems/ProximitySystem";
import { CollectibleSystem } from "../systems/CollectibleSystem";
import { MissionManager } from "../systems/MissionManager";
import { ProgressionSystem } from "../systems/ProgressionSystem";
import { ReactivitySystem } from "../systems/ReactivitySystem";
import { DestructionSystem } from "../systems/DestructionSystem";
import { AudioSystem } from "../systems/AudioSystem";

export class WorldScene extends Phaser.Scene {
  private car!: CarController;
  private rig!: CameraRig;
  private tire!: TireMarks;
  private proximity!: ProximitySystem;
  private collectibles!: CollectibleSystem;
  private mission!: MissionManager;
  private progression!: ProgressionSystem;
  private reactivity!: ReactivitySystem;
  private destruction!: DestructionSystem;
  private audio!: AudioSystem;

  private removeInput: () => void = () => {};
  private unsub: () => void = () => {};
  private lastMuted = gameStore.getState().muted;
  private lastArea: AreaId | null = null;
  private jokeIx = 0;

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
        .image(area.center.x, area.center.y, "area-blob")
        .setDisplaySize(area.footprint.w * 1.25, area.footprint.h * 1.25)
        .setTint(hex(area.palette.ground))
        .setAlpha(0.9)
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

    // --- car + camera ---
    const s = WORLD.spawn;
    this.car = new CarController(this, s.x, s.y, s.angle, VEHICLES[DEFAULT_VEHICLE]);
    this.rig = new CameraRig(this, this.car, W, H);

    // --- systems that depend on car ---
    this.tire = new TireMarks(this);
    this.proximity = new ProximitySystem(WORLD.anchors);
    this.collectibles = new CollectibleSystem(this, WORLD.collectibles, this.audio);
    this.mission = new MissionManager(this, this.car, this.audio);
    this.progression = new ProgressionSystem(this.car);

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
        mass: inst.physics === "pushable" ? 0.5 : 3,
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
      kind === "dirt" ? 0xb79366 : kind === "boardwalk" ? 0xc39a63 : hex(PALETTE.road);
    for (const road of WORLD.roads) {
      const surface = surfaceOf(road.kind);
      const half = road.width / 2;
      g.fillStyle(surface, 1);
      g.lineStyle(road.width, surface, 1);
      const pts = road.points;
      for (let i = 0; i < pts.length - 1; i++) {
        g.beginPath();
        g.moveTo(pts[i].x, pts[i].y);
        g.lineTo(pts[i + 1].x, pts[i + 1].y);
        g.strokePath();
      }
      // round the joints
      for (const p of pts) g.fillCircle(p.x, p.y, half);

      // dashed centre line (paved roads only)
      if (road.kind === "asphalt") {
        this.dashLine(g, pts, hex(PALETTE.roadLine));
      } else if (road.kind === "boardwalk") {
        this.plankLines(g, pts, road.width);
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
      if (!kind) continue;
      const impact = this.carSpeedPx();

      if (physics === "decor") {
        if (kind === "bush") this.destruction.bushRustle(other.x, other.y);
        else if (kind === "puddle") this.destruction.puddleSplash(other.x, other.y);
        else if (kind === "ramp") this.car.hop();
        continue;
      }
      if (physics === "destructible") {
        if (impact > TUNING.destroySpeedThreshold) {
          this.destruction.smash(other as Phaser.GameObjects.Image, impact);
          this.car.onCollision(impact);
        } else {
          this.destruction.thud(other.x, other.y, impact);
        }
        continue;
      }
      if (physics === "pushable") {
        this.destruction.thud(other.x, other.y, impact * 0.5);
        if (impact > TUNING.crashSpeedThreshold) this.car.onCollision(impact);
        continue;
      }
      // solid static
      if (impact > TUNING.crashSpeedThreshold) {
        this.destruction.thud(other.x, other.y, impact);
        this.car.onCollision(impact);
      }
    }
  }

  update(time: number, delta: number) {
    if (!this.car) return;

    this.car.update(carInput, delta);
    this.rig.update(delta);
    this.tire.update(this.car);

    // drift dust
    if (this.car.driftLoad > 0.32) {
      const [x1, y1] = this.car.rearWheels();
      this.destruction.driftPuff(x1, y1);
    }

    this.proximity.update(this.car.x, this.car.y);

    // interact / dismiss
    if (carInput.interact) {
      carInput.interact = false;
      if (this.proximity.near) gameStore.focus(this.proximity.near.id);
    }
    if (carInput.dismiss) {
      carInput.dismiss = false;
      if (gameStore.getState().focusedId) gameStore.focus(null);
    }

    this.collectibles.update(this.car.x, this.car.y);
    this.mission.update(delta);
    this.progression.update();
    this.reactivity.update(this.car.x, this.car.y, time);

    // area transitions
    const area = areaAt(this.car.x, this.car.y);
    if (area.id !== this.lastArea) {
      this.lastArea = area.id;
      gameStore.setArea(area.id);
      if (gameStore.getState().audioStarted) this.audio.setArea(area.audio);
    }

    // fast-travel request from the minimap
    if (frame.requestTravel) {
      const { x, y } = frame.requestTravel;
      frame.requestTravel = null;
      this.car.body.setPosition(x, y);
      this.car.body.setVelocity(0, 0);
      this.cameras.main.flash(320, 244, 237, 224);
    }

    // telemetry → React (no re-render)
    frame.playerX = this.car.x;
    frame.playerY = this.car.y;
    frame.heading = this.car.angle;
    frame.speed = this.car.speedNorm;
    frame.rpm = this.car.rpm;
    frame.driftLoad = this.car.driftLoad;
    frame.nitro = this.car.nitroActive;

    if (gameStore.getState().audioStarted) {
      this.audio.update(this.car.rpm, carInput.throttle, this.car.driftLoad);
    }
  }

  private teardown() {
    this.removeInput();
    this.unsub();
    this.matter.world.off("collisionstart", this.onCollisionStart, this);
    this.audio?.dispose();
  }
}
