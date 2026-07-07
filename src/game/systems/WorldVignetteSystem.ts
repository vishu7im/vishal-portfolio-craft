import Phaser from "phaser";
import { gameStore } from "../state/gameStore";
import { PALETTE, hex } from "../config/palette";

interface VignetteContext {
  carX: number;
  carY: number;
  time: number;
  delta: number;
}

interface Vignette {
  id: string;
  x: number;
  y: number;
  radius: number;
  update(ctx: VignetteContext): void;
  destroy?(): void;
}

const INK = hex(PALETTE.ink);
const PAPER = hex(PALETTE.paper);
const PANEL = 0x2a303b;
const PANEL_2 = 0x39414f;
const GREEN = 0x4ce0a0;
const BLUE = 0x39a0f0;
const PURPLE = 0x7b5cff;
const ORANGE = 0xf0813a;
const YELLOW = 0xf2b843;
const RED = 0xe04f3f;
const FONT = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "Inter, ui-sans-serif, system-ui, sans-serif";
const WHITE_STROKE = "#f4ede0";
const DARK_STROKE = "#20242c";

function depthFor(y: number, offset = 0) {
  return 10 + y + offset;
}

function clamp01(n: number) {
  return Phaser.Math.Clamp(n, 0, 1);
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export class WorldVignetteSystem {
  private readonly scene: Phaser.Scene;
  private readonly vignettes: Vignette[] = [];
  private readonly awarded = new Set<string>();

  private readonly sparks: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly smoke: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly confetti: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly codeBits: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly bugBits: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.sparks = scene.add
      .particles(0, 0, "sparkle", {
        speed: { min: 80, max: 260 },
        scale: { start: 0.9, end: 0 },
        lifespan: 560,
        quantity: 12,
        emitting: false,
        blendMode: Phaser.BlendModes.ADD,
      })
      .setDepth(99999);

    this.smoke = scene.add
      .particles(0, 0, "soft", {
        tint: 0x66707e,
        speed: { min: 18, max: 85 },
        scale: { start: 0.55, end: 1.8 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 1050,
        quantity: 4,
        emitting: false,
      })
      .setDepth(99998);

    this.confetti = scene.add
      .particles(0, 0, "sparkle", {
        tint: [0x39a0f0, 0x4ce0a0, 0xf2b843, 0xf0813a, 0x7b5cff],
        speed: { min: 80, max: 240 },
        angle: { min: 230, max: 310 },
        gravityY: 180,
        scale: { start: 0.6, end: 0 },
        lifespan: 1000,
        quantity: 20,
        emitting: false,
      })
      .setDepth(99999);

    this.codeBits = scene.add
      .particles(0, 0, "soft", {
        tint: 0x4ce0a0,
        speed: { min: 35, max: 110 },
        scale: { start: 0.34, end: 0 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 650,
        quantity: 5,
        emitting: false,
      })
      .setDepth(99998);

    this.bugBits = scene.add
      .particles(0, 0, "soft", {
        tint: [0xe04f3f, 0x4ce0a0, 0xf2b843],
        speed: { min: 70, max: 220 },
        scale: { start: 0.7, end: 0 },
        lifespan: 520,
        quantity: 16,
        emitting: false,
      })
      .setDepth(99998);

    this.vignettes.push(
      this.createAiLab(),
      this.createProductionIncident(),
      this.createDevOpsFactory(),
      this.createBugSwamp(),
      this.createOpenSourcePark(),
      this.createAiTrainingArea(),
      this.createDataPipelineRiver(),
      this.createApiHighway(),
      this.createAchievementMountain(),
      this.createCareerTrain(),
      this.createResumeMuseum(),
      this.createSkillTemple(),
      this.createVoiceAiDemo(),
      this.createDatabaseVault(),
      this.createHotelBooking(),
      this.createBroadcastQueue(),
      this.createReconciliation(),
      this.createSecret("ai-bunker", 2450, 6900, "Hidden AI Bunker", "Tool-use agents hum below the lab floor.", PURPLE),
      this.createSecret("github-cave", 7250, 6180, "Secret GitHub Cave", "Old branches, useful scripts, and hard-earned fixes.", GREEN),
      this.createSecret("prototype-arcade", 8500, 4500, "Old 8-bit Prototype", "First portfolio build unlocked in the arcade cabinet.", YELLOW)
    );
  }

  update(carX: number, carY: number, time: number, delta: number) {
    const ctx = { carX, carY, time, delta };
    for (const v of this.vignettes) v.update(ctx);
  }

  destroy() {
    for (const v of this.vignettes) v.destroy?.();
    this.sparks.destroy();
    this.smoke.destroy();
    this.confetti.destroy();
    this.codeBits.destroy();
    this.bugBits.destroy();
  }

  private proximity(ctx: VignetteContext, v: { x: number; y: number; radius: number }, inner = 150) {
    return clamp01(1 - (dist(ctx.carX, ctx.carY, v.x, v.y) - inner) / (v.radius - inner));
  }

  private container(x: number, y: number, offset = 0) {
    return this.scene.add.container(x, y).setDepth(depthFor(y, offset));
  }

  private rounded(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: number,
    alpha = 1,
    stroke = INK
  ) {
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x151922, 0.18);
    shadow.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 10, w, h, 12);
    parent.add(shadow);

    const g = this.scene.add.graphics();
    g.fillStyle(fill, alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.fillStyle(0xffffff, alpha * 0.08);
    g.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, Math.max(16, h * 0.22), 9);
    g.lineStyle(2, stroke, 0.72);
    g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    parent.add(g);
    return g;
  }

  private floorDecal(
    parent: Phaser.GameObjects.Container,
    w: number,
    h: number,
    accent: number,
    alpha = 0.3,
    y = 0
  ) {
    const glow = this.scene.add
      .image(0, y, "glow")
      .setTint(accent)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(alpha * 0.9)
      .setScale(w / 128, h / 128);
    const g = this.scene.add.graphics();
    g.fillStyle(0x151922, 0.1);
    g.fillEllipse(0, y + h * 0.13, w * 0.9, h * 0.42);
    g.lineStyle(2, accent, alpha);
    g.strokeEllipse(0, y, w, h * 0.62);
    g.strokeEllipse(0, y, w * 0.72, h * 0.43);
    g.lineStyle(1, 0xffffff, alpha * 0.22);
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo((i * w) / 8, y - h * 0.26);
      g.lineTo((i * w) / 10, y + h * 0.26);
      g.strokePath();
    }
    parent.add([glow, g]);
    return { glow, g };
  }

  private screenPanel(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    accent: number,
    alpha = 0.96
  ) {
    const shadow = this.scene.add.rectangle(x + 6, y + 7, w, h, 0x151922, 0.2);
    const panel = this.scene.add.rectangle(x, y, w, h, PANEL, alpha).setStrokeStyle(2, accent, 0.72);
    const sheen = this.scene.add.rectangle(x - w * 0.18, y - h * 0.25, w * 0.48, 3, 0xffffff, 0.2);
    parent.add([shadow, panel, sheen]);
    return panel;
  }

  private chip(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    accent: number,
    w = Math.max(56, text.length * 7.5 + 18)
  ) {
    const box = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf4ede0, 0.92);
    bg.fillRoundedRect(-w / 2, -14, w, 28, 8);
    bg.lineStyle(1.5, accent, 0.72);
    bg.strokeRoundedRect(-w / 2, -14, w, 28, 8);
    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: FONT,
        fontSize: "10px",
        color: "#20242c",
        align: "center",
      })
      .setOrigin(0.5);
    box.add([bg, label]);
    parent.add(box);
    return box;
  }

  private localText(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    text: string,
    size = 12,
    color = "#f4ede0",
    family = FONT
  ) {
    const t = this.scene.add
      .text(x, y, text, {
        fontFamily: family,
        fontSize: `${size}px`,
        color,
        align: "center",
        stroke: color === "#20242c" ? WHITE_STROKE : DARK_STROKE,
        strokeThickness: size <= 10 ? 2 : 3,
      })
      .setOrigin(0.5);
    parent.add(t);
    return t;
  }

  private worldLabel(x: number, y: number, text: string, color = "#20242c") {
    return this.scene.add
      .text(x, y, text, {
        fontFamily: SANS,
        fontSize: "13px",
        fontStyle: "700",
        color,
        align: "center",
        backgroundColor: "rgba(244,237,224,0.86)",
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setPadding(9, 4, 9, 4)
      .setDepth(depthFor(y, 80));
  }

  private notice(x: number, y: number, text: string, tint = "#20242c") {
    const n = this.scene.add
      .text(x, y, text, {
        fontFamily: FONT,
        fontSize: "14px",
        color: tint,
        align: "center",
        backgroundColor: "rgba(244,237,224,0.86)",
        stroke: "#ffffff",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setPadding(8, 5, 8, 5)
      .setDepth(100000);
    this.scene.tweens.add({
      targets: n,
      y: y - 54,
      alpha: 0,
      duration: 1350,
      ease: "Cubic.out",
      onComplete: () => n.destroy(),
    });
  }

  private awardOnce(id: string, value: number, x: number, y: number, text: string) {
    const saveId = `world-vignette-${id}`;
    if (this.awarded.has(saveId) || gameStore.isCollected(saveId)) return;
    this.awarded.add(saveId);
    gameStore.collect(saveId, value);
    this.notice(x, y, `${text} +${value}`, "#20242c");
    this.sparks.emitParticleAt(x, y, 18);
  }

  private createAiLab(): Vignette {
    const v = { id: "ai-lab", x: 900, y: 5450, radius: 760 };
    const c = this.container(v.x, v.y, 65);
    this.floorDecal(c, 470, 300, PURPLE, 0.42, 12);
    this.rounded(c, 0, 0, 330, 220, 0x251f48, 0.9, 0x8c7cff);
    this.worldLabel(v.x, v.y - 170, "AI Laboratory");

    const pad = this.screenPanel(c, 0, 55, 260, 70, PURPLE, 0.92);
    const leftRoof = this.scene.add.rectangle(-72, -20, 145, 178, 0x716c91, 1).setStrokeStyle(2, 0x2a2547, 0.85);
    const rightRoof = this.scene.add.rectangle(72, -20, 145, 178, 0x5c587a, 1).setStrokeStyle(2, 0x2a2547, 0.85);
    const roofLines = [-1, 1].map((side) => {
      const g = this.scene.add.graphics();
      g.lineStyle(2, 0xded6ff, 0.18);
      for (let yy = -82; yy <= 48; yy += 26) {
        g.beginPath();
        g.moveTo(side * 16, yy);
        g.lineTo(side * 130, yy - side * 16);
        g.strokePath();
      }
      return g;
    });
    const armG = this.scene.add.graphics();
    const brain = this.scene.add.container(0, -36);
    const brainGlow = this.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(1.25);
    const brainCore = this.scene.add.circle(0, 0, 36, PURPLE, 0.72).setStrokeStyle(2, 0xded6ff, 0.95);
    const nodes = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return this.scene.add.circle(Math.cos(a) * 25, Math.sin(a) * 18, 3.8, 0xffffff, 0.95);
    });
    brain.add([brainGlow, brainCore, ...nodes]);

    const waveRings = [0, 1, 2].map((i) =>
      this.scene.add.ellipse(0, -36, 108 + i * 28, 48 + i * 16).setStrokeStyle(2, 0xcfc6ff, 0)
    );
    const tags = ["Voice AI", "Realtime", "OpenAI", "Twilio", "Tools"].map((label, i) =>
      this.chip(c, -140 + i * 70, 112, label, PURPLE, i === 0 ? 78 : 66)
    );

    const screen = this.localText(c, 0, 48, "STT -> LLM -> TTS", 13, "#4ce0a0");
    c.add([leftRoof, rightRoof, ...roofLines, armG, ...waveRings, brain]);

    let wasNear = false;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 210);
        const near = p > 0.08;
        if (near && !wasNear) this.notice(v.x, v.y - 215, "The roof opens. The lab boots itself.", "#5a3cff");
        wasNear = near;

        const open = Phaser.Math.Easing.Cubic.Out(p);
        leftRoof.setPosition(-72 - open * 88, -20 - open * 14).setAlpha(1 - open * 0.44);
        rightRoof.setPosition(72 + open * 88, -20 - open * 14).setAlpha(1 - open * 0.44);
        roofLines.forEach((line, i) => {
          const side = i === 0 ? -1 : 1;
          line.setPosition(side * open * 88, -open * 14).setAlpha(1 - open * 0.5);
        });
        brain.setAlpha(open).setScale(0.7 + open * 0.35).setRotation(ctx.time * 0.0011);
        brainGlow.setAlpha(0.55 + Math.sin(ctx.time * 0.006) * 0.18);
        screen.setAlpha(0.25 + p * 0.75);

        armG.clear();
        armG.lineStyle(8, 0xa79bff, 0.35 + p * 0.55);
        for (const side of [-1, 1]) {
          const shoulderX = side * 132;
          const elbowX = side * (88 + Math.sin(ctx.time * 0.003 + side) * 22);
          const elbowY = -22 + Math.cos(ctx.time * 0.004 + side) * 18;
          const handX = side * 40;
          const handY = 4 + Math.sin(ctx.time * 0.005 + side) * 12;
          armG.beginPath();
          armG.moveTo(shoulderX, -76);
          armG.lineTo(elbowX, elbowY);
          armG.lineTo(handX, handY);
          armG.strokePath();
          armG.fillStyle(0xded6ff, 0.6 + p * 0.4);
          armG.fillCircle(handX, handY, 9);
        }

        waveRings.forEach((ring, i) => {
          const q = ((ctx.time * 0.001 + i / 3) % 1) * p;
          ring.setAlpha(p * (1 - q) * 0.8);
          ring.setScale(0.8 + q * 0.9);
        });
        tags.forEach((tag, i) => {
          tag.setAlpha(p);
          tag.setY(112 + Math.sin(ctx.time * 0.004 + i) * 5);
        });
      },
    };
  }

  private createProductionIncident(): Vignette {
    const v = { id: "production-server", x: 4200, y: 5500, radius: 700 };
    const c = this.container(v.x, v.y, 70);
    this.floorDecal(c, 440, 285, BLUE, 0.34, 12);
    this.rounded(c, 0, 0, 330, 220, 0x202631, 0.92, 0x6a98bd);
    this.worldLabel(v.x, v.y - 165, "Production Server");

    const racks = Array.from({ length: 5 }, (_, i) => {
      const rack = this.screenPanel(c, -120 + i * 60, -24, 44, 130, i === 1 ? GREEN : BLUE, 0.96);
      c.add(rack);
      for (let j = 0; j < 5; j++) {
        const led = this.scene.add.circle(-136 + i * 60, -76 + j * 24, 3, j % 2 ? GREEN : BLUE, 0.9);
        c.add(led);
      }
      return rack;
    });
    const alarm = this.scene.add.rectangle(0, -102, 284, 18, RED, 0).setStrokeStyle(1, 0xffc2bd, 0.7);
    const fan = this.scene.add.star(128, 82, 6, 6, 26, 0xdbe6ef, 0.9).setStrokeStyle(1, INK);
    const fire = this.scene.add.triangle(-42, 35, 0, -28, 22, 24, -22, 24, ORANGE, 0.95).setVisible(false);
    const status = this.localText(c, 0, 92, "stable: latency 38ms", 13, "#4ce0a0");
    c.add([alarm, fan, fire]);

    let incidentStart = -20000;
    let exploded = false;
    let wasNear = false;

    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 180);
        const near = p > 0.08;
        if (near && (!wasNear || ctx.time - incidentStart > 18000)) {
          incidentStart = ctx.time;
          exploded = false;
          this.notice(v.x, v.y - 200, "Production Incident detected.", "#b02420");
        }
        wasNear = near;

        const t = (ctx.time - incidentStart) / 10500;
        const active = near && t >= 0 && t <= 1;
        const blink = Math.sin(ctx.time * 0.025) > 0 ? 1 : 0.25;
        alarm.setAlpha(active ? blink * 0.85 : 0);
        fan.setRotation(ctx.time * (active && t > 0.48 ? 0.018 : 0.006));
        fire.setVisible(active && t > 0.22 && t < 0.68).setScale(1 + Math.sin(ctx.time * 0.03) * 0.12);

        if (active && t > 0.25 && !exploded) {
          exploded = true;
          this.sparks.emitParticleAt(v.x - 42, v.y + 35, 32);
          this.smoke.emitParticleAt(v.x - 42, v.y + 28, 18);
        }
        if (active && t > 0.26 && t < 0.82) this.smoke.emitParticleAt(v.x - 42, v.y + 28, 2);

        racks.forEach((rack, i) => {
          rack.setFillStyle(active && t < 0.72 ? (i === 1 ? 0x542c2c : 0x414957) : PANEL_2);
          rack.setX(-120 + i * 60 + (active && t < 0.55 ? Math.sin(ctx.time * 0.08 + i) * 1.6 : 0));
        });

        if (!active) status.setText("stable: latency 38ms").setColor("#4ce0a0");
        else if (t < 0.25) status.setText("Production Incident\n502 Gateway").setColor("#ffb0a8");
        else if (t < 0.55) status.setText("Memory Leak\nRedis Down").setColor("#ffdf8a");
        else if (t < 0.82) status.setText("Emergency fans online\nrolling restart").setColor("#dbe6ef");
        else status.setText("Recovered in 12 minutes").setColor("#4ce0a0");
      },
    };
  }

  private createDevOpsFactory(): Vignette {
    const v = { id: "devops-factory", x: 5400, y: 5500, radius: 730 };
    const c = this.container(v.x, v.y, 70);
    this.floorDecal(c, 500, 300, GREEN, 0.32, 12);
    this.rounded(c, 0, 0, 380, 230, 0x26313a, 0.91, 0x7fc9d8);
    this.worldLabel(v.x, v.y - 172, "DevOps Factory");

    const belt = this.screenPanel(c, -40, 10, 300, 54, GREEN, 0.96);
    const beltLines = Array.from({ length: 9 }, (_, i) =>
      this.scene.add.rectangle(-170 + i * 38, 10, 3, 52, 0x4ce0a0, 0.18)
    );
    const progressBg = this.scene.add.rectangle(-92, 94, 184, 12, 0x151922, 1).setOrigin(0, 0.5).setStrokeStyle(1, 0x59606f);
    const progressFill = this.scene.add.rectangle(-90, 94, 180, 8, GREEN, 0.95).setOrigin(0, 0.5);
    const rocket = this.scene.add.container(152, 66);
    rocket.add([
      this.scene.add.triangle(0, -28, 0, -44, 18, -16, -18, -16, YELLOW, 1).setStrokeStyle(1, INK),
      this.scene.add.rectangle(0, 4, 30, 48, 0xeaf2f8, 1).setStrokeStyle(1, INK),
      this.scene.add.triangle(0, 36, -15, 24, 15, 24, 0, 48, ORANGE, 0.95),
    ]);
    const actionText = this.localText(c, 0, -82, "GitHub Action waiting", 13, "#dbe6ef");
    const completeText = this.localText(c, 0, 116, "", 13, "#4ce0a0");
    const logos = ["Docker", "Redis", "Node.js", "Postgres", "RabbitMQ", "GitHub", "K8s"].map((label, i) => {
      const box = this.chip(c, 0, 10, label, GREEN, label.length > 7 ? 82 : 68);
      return { label, box, offset: i * 88 };
    });
    const armG = this.scene.add.graphics();
    c.add([...beltLines, progressBg, progressFill, rocket, armG]);

    let lastConfettiCycle = -1;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 180);
        const cycle = Math.floor(ctx.time / 20000);
        const phase = (ctx.time % 20000) / 20000;
        const deployment = p > 0.05 ? Math.min(1, phase * 1.42) : 0;

        logos.forEach((item) => {
          const x = -178 + ((ctx.time * 0.05 + item.offset) % 330);
          item.box.setPosition(x, 10 + Math.sin(ctx.time * 0.006 + item.offset) * 2);
          item.box.setAlpha(0.55 + p * 0.45);
        });
        beltLines.forEach((line, i) => line.setX(-170 + (((ctx.time * 0.08 + i * 38) % 340))));

        armG.clear();
        armG.lineStyle(7, 0x9fc4e2, 0.5 + p * 0.4);
        for (const side of [-1, 1]) {
          const baseX = side * 120;
          const grabX = side * 50 + Math.sin(ctx.time * 0.004 + side) * 30;
          armG.beginPath();
          armG.moveTo(baseX, -72);
          armG.lineTo(grabX, -18);
          armG.lineTo(grabX, 24);
          armG.strokePath();
        }

        progressFill.setScale(deployment, 1);
        actionText.setText(p > 0.05 ? `GitHub Action: ${Math.floor(deployment * 100)}%` : "GitHub Action waiting");
        completeText.setText(deployment >= 1 ? "Deployment Complete" : "");
        const launch = clamp01((phase - 0.68) / 0.22) * p;
        rocket.setY(66 - launch * 255);
        rocket.setAlpha(0.5 + p * 0.5);
        if (p > 0.2 && deployment >= 1 && lastConfettiCycle !== cycle) {
          lastConfettiCycle = cycle;
          this.confetti.emitParticleAt(v.x, v.y - 105, 32);
          this.notice(v.x, v.y - 210, "CI/CD rocket launched.", "#1f7f5b");
        }
      },
    };
  }

  private createBugSwamp(): Vignette {
    const v = { id: "bug-swamp", x: 2480, y: 2100, radius: 650 };
    const c = this.container(v.x, v.y, 40);
    this.floorDecal(c, 520, 310, GREEN, 0.22, 6);
    this.worldLabel(v.x, v.y - 170, "Bug Swamp");
    const pond = this.scene.add.graphics();
    pond.fillStyle(0x2f5f46, 0.42);
    pond.fillEllipse(0, 0, 430, 250);
    pond.lineStyle(3, 0x8ac68f, 0.34);
    pond.strokeEllipse(0, 0, 410, 232);
    pond.fillStyle(0x8ac68f, 0.24);
    pond.fillEllipse(-70, -22, 170, 80);
    pond.fillEllipse(105, 34, 160, 70);
    pond.lineStyle(4, 0xcfe3bf, 0.28);
    for (let i = 0; i < 14; i++) {
      const x = -205 + i * 32;
      pond.beginPath();
      pond.moveTo(x, 96 + Math.sin(i) * 12);
      pond.lineTo(x + Math.sin(i * 2) * 14, 68 + Math.cos(i) * 12);
      pond.strokePath();
    }
    c.add(pond);
    const xp = this.localText(c, 0, 140, "Bug XP: 0", 13, "#20242c");

    const defs = [
      { name: "Memory Leak", color: RED, x: -145, y: -60, shape: "monster" },
      { name: "Race Condition", color: 0xded6ff, x: 120, y: -78, shape: "ghost" },
      { name: "Null Pointer", color: GREEN, x: -80, y: 78, shape: "slime" },
      { name: "Infinite Loop", color: YELLOW, x: 120, y: 72, shape: "tornado" },
    ];
    let score = 0;
    const bugs = defs.map((def, i) => {
      const body = this.scene.add.container(def.x, def.y);
      if (def.shape === "tornado") {
        const g = this.scene.add.graphics();
        g.lineStyle(5, def.color, 0.9);
        g.beginPath();
        g.moveTo(-20, -20);
        g.lineTo(22, -10);
        g.lineTo(-16, 0);
        g.lineTo(20, 12);
        g.lineTo(-10, 24);
        g.strokePath();
        body.add(g);
      } else {
        body.add(this.scene.add.circle(0, 0, def.shape === "ghost" ? 22 : 25, def.color, 0.88).setStrokeStyle(2, INK));
        body.add(this.scene.add.circle(-8, -5, 3, INK, 1));
        body.add(this.scene.add.circle(8, -5, 3, INK, 1));
      }
      body.add(
        this.scene.add
          .text(0, 38, def.name, { fontFamily: FONT, fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
          .setOrigin(0.5)
      );
      c.add(body);
      return { ...def, body, alive: true, respawnAt: 0, index: i };
    });

    return {
      ...v,
      update: (ctx) => {
        this.proximity(ctx, v, 180);
        for (const bug of bugs) {
          if (!bug.alive && ctx.time > bug.respawnAt) {
            bug.alive = true;
            bug.body.setVisible(true).setScale(0.2);
            this.scene.tweens.add({ targets: bug.body, scale: 1, duration: 240, ease: "Back.out" });
          }
          if (!bug.alive) continue;
          bug.body.setPosition(
            bug.x + Math.sin(ctx.time * 0.0025 + bug.index) * 18,
            bug.y + Math.cos(ctx.time * 0.003 + bug.index) * 14
          );
          bug.body.setRotation(bug.shape === "tornado" ? ctx.time * 0.008 : Math.sin(ctx.time * 0.004 + bug.index) * 0.12);
          const wx = v.x + bug.body.x;
          const wy = v.y + bug.body.y;
          if (dist(ctx.carX, ctx.carY, wx, wy) < 82) {
            bug.alive = false;
            bug.respawnAt = ctx.time + 12000;
            bug.body.setVisible(false);
            score += 5;
            xp.setText(`Bug XP: ${score}`);
            this.bugBits.emitParticleAt(wx, wy, 22);
            this.notice(wx, wy - 30, "Bug Fixed", "#236342");
            gameStore.addXp(5);
            gameStore.award("ach-first-bug");
          }
        }
      },
    };
  }

  private createOpenSourcePark(): Vignette {
    const v = { id: "open-source-park", x: 4150, y: 1950, radius: 620 };
    const c = this.container(v.x, v.y, 58);
    this.floorDecal(c, 360, 230, GREEN, 0.2, 16);
    this.worldLabel(v.x, v.y - 142, "Open Source Park");
    this.rounded(c, 0, 12, 250, 160, 0xcfe3bf, 0.75, 0x4c9a6a);
    const base = this.screenPanel(c, 0, 32, 150, 78, GREEN, 0.98);
    const lid = this.scene.add.rectangle(0, -32, 150, 18, 0x39414f, 1).setStrokeStyle(2, GREEN, 0.55);
    const terminal = this.localText(c, 0, 18, "", 11, "#4ce0a0");
    const stars = this.localText(c, 0, 82, "stars: 42", 13, "#20242c");
    c.add([base, lid]);
    let start = -1;

    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 150);
        if (p > 0.08 && start < 0) {
          start = ctx.time;
          this.notice(v.x, v.y - 185, "Laptop wakes up. Commits start landing.", "#236342");
        }
        const progress = start < 0 ? 0 : clamp01((ctx.time - start) / 6500);
        lid.setY(-32 - p * 44);
        lid.setScale(1, 1 + p * 0.7);
        const lines = [
          "$ git commit -m backend-systems",
          "+ workers + queues + APIs",
          "+ typed services + docs",
          "Built reusable backend systems.",
        ];
        const visible = Math.max(1, Math.floor(progress * lines.length + 0.8));
        terminal.setText(lines.slice(0, visible).join("\n"));
        stars.setText(`stars: ${42 + Math.floor(progress * 1180)}`);
        if (p > 0.15) this.codeBits.emitParticleAt(v.x, v.y - 30, 1);
      },
    };
  }

  private createAiTrainingArea(): Vignette {
    const v = { id: "ai-training", x: 1500, y: 6550, radius: 650 };
    const c = this.container(v.x, v.y, 64);
    this.floorDecal(c, 420, 270, PURPLE, 0.36, 6);
    this.worldLabel(v.x, v.y - 165, "AI Training Area");
    const core = this.scene.add.circle(0, 0, 44, PURPLE, 0.85).setStrokeStyle(3, 0xded6ff);
    const coreRing = this.scene.add.ellipse(0, 0, 118, 76).setStrokeStyle(2, 0xded6ff, 0.45);
    const glow = this.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(1.4);
    const status = this.localText(c, 0, 92, "Training idle", 14, "#20242c");
    c.add([glow, coreRing, core]);
    const particles = Array.from({ length: 54 }, (_, i) => {
      const dot = this.scene.add.circle(0, 0, 3 + (i % 3), i % 2 ? 0xded6ff : 0x4ce0a0, 0.95);
      c.add(dot);
      return { dot, a: (i / 54) * Math.PI * 2, r: 92 + (i % 7) * 13, speed: 0.0015 + (i % 5) * 0.00035 };
    });
    let start = -1;
    let deployed = false;

    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        if (p > 0.12 && start < 0) {
          start = ctx.time;
          this.notice(v.x, v.y - 208, "Particles collapse into a training run.", "#5a3cff");
        }
        const training = start < 0 ? 0 : clamp01((ctx.time - start) / 7000);
        particles.forEach((pt, i) => {
          const pull = p > 0.1 ? training : 0;
          const r = Phaser.Math.Linear(pt.r, 24 + (i % 5) * 4, pull);
          const a = pt.a + ctx.time * pt.speed;
          pt.dot.setPosition(Math.cos(a) * r, Math.sin(a) * r * 0.72);
          pt.dot.setAlpha(0.35 + p * 0.65);
        });
        core.setScale(1 + Math.sin(ctx.time * 0.008) * 0.05 + training * 0.18);
        coreRing.setRotation(ctx.time * 0.0018).setScale(1 + training * 0.18);
        glow.setAlpha(0.25 + p * 0.65);
        if (training <= 0) status.setText("Training idle");
        else if (training < 1) status.setText(`Training...\naccuracy ${Math.floor(32 + training * 59)}%`);
        else {
          status.setText("Done\nModel Deployed");
          if (!deployed) {
            deployed = true;
            this.confetti.emitParticleAt(v.x, v.y - 40, 24);
          }
        }
      },
    };
  }

  private createDataPipelineRiver(): Vignette {
    const v = { id: "data-pipeline", x: 1150, y: 4550, radius: 650 };
    const c = this.container(v.x, v.y, 66);
    this.floorDecal(c, 560, 250, BLUE, 0.22, 12);
    this.worldLabel(v.x, v.y - 155, "Data Pipeline River");
    const pipe = this.scene.add.graphics();
    pipe.lineStyle(42, 0x151922, 0.16);
    pipe.beginPath();
    pipe.moveTo(-230, -14);
    pipe.lineTo(-80, -50);
    pipe.lineTo(80, 38);
    pipe.lineTo(230, -4);
    pipe.strokePath();
    pipe.lineStyle(34, 0x57c4d6, 0.72);
    pipe.beginPath();
    pipe.moveTo(-230, -20);
    pipe.lineTo(-80, -56);
    pipe.lineTo(80, 32);
    pipe.lineTo(230, -10);
    pipe.strokePath();
    pipe.lineStyle(6, 0xffffff, 0.45);
    pipe.strokePath();
    c.add(pipe);
    const breakSpot = this.scene.add.circle(78, 28, 22, RED, 0.7).setStrokeStyle(2, INK);
    const malformed = this.localText(c, 88, 88, "{bad json", 11, "#e04f3f");
    const status = this.localText(c, 0, 126, "ETL flowing", 13, "#20242c");
    c.add(breakSpot);
    const records = ["{user}", "{order}", "{event}", "{vector}", "{invoice}", "{agent}"].map((label, i) => {
      const t = this.localText(c, 0, 0, label, 10, "#20242c");
      return { t, offset: i * 86 };
    });
    let repair = 0;
    return {
      ...v,
      update: (ctx) => {
        const d = dist(ctx.carX, ctx.carY, v.x + 78, v.y + 28);
        const nearBreak = d < 170;
        if (nearBreak) repair = Math.min(1, repair + ctx.delta / 2600);
        const fixed = repair >= 1;
        breakSpot.setFillStyle(fixed ? GREEN : RED, fixed ? 0.55 : 0.7);
        malformed.setVisible(!fixed).setY(88 + Math.sin(ctx.time * 0.006) * 10);
        status.setText(fixed ? "10M Records Processed" : nearBreak ? `fixing pipe ${Math.floor(repair * 100)}%` : "malformed JSON leak");
        if (fixed) status.setColor("#236342");
        records.forEach((r) => {
          const x = -230 + ((ctx.time * (fixed ? 0.07 : 0.035) + r.offset) % 460);
          r.t.setPosition(x, Math.sin((x + ctx.time * 0.04) * 0.02) * 38);
          r.t.setAlpha(fixed ? 1 : 0.65);
        });
        if (nearBreak && !fixed) this.sparks.emitParticleAt(v.x + 78, v.y + 28, 1);
      },
    };
  }

  private createApiHighway(): Vignette {
    const v = { id: "api-highway", x: 4800, y: 3700, radius: 690 };
    const c = this.container(v.x, v.y, 52);
    this.floorDecal(c, 520, 260, BLUE, 0.2, 2);
    this.worldLabel(v.x, v.y - 170, "API Highway");
    const road = this.scene.add.rectangle(0, 0, 430, 170, 0x31363f, 0.92).setStrokeStyle(2, BLUE, 0.36);
    const lane1 = this.scene.add.rectangle(0, -42, 400, 4, PAPER, 0.7);
    const lane2 = this.scene.add.rectangle(0, 42, 400, 4, PAPER, 0.7);
    const limiter = this.localText(c, 0, 94, "", 13, "#f2b843");
    c.add([road, lane1, lane2]);
    const calls = ["GET", "POST", "PUT", "PATCH", "SLOW", "429"].map((label, i) => {
      const car = this.scene.add.container(0, 0);
      car.add(this.scene.add.rectangle(0, 0, label === "SLOW" ? 62 : 48, 26, label === "429" ? RED : BLUE, 0.95).setStrokeStyle(1, INK));
      car.add(this.scene.add.text(0, 0, label, { fontFamily: FONT, fontSize: "10px", color: "#ffffff" }).setOrigin(0.5));
      c.add(car);
      return { label, car, offset: i * 94, lane: i % 3 };
    });
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        const phase = (ctx.time % 9000) / 9000;
        const crash = phase > 0.46 && phase < 0.62;
        calls.forEach((call, i) => {
          let x = -215 + ((ctx.time * (call.label === "SLOW" ? 0.035 : 0.075) + call.offset) % 430);
          let y = [-60, 0, 60][call.lane];
          if (crash && call.label === "429") {
            x = 28 + Math.sin(ctx.time * 0.03) * 3;
            y = 0;
            call.car.setRotation(0.55);
            this.smoke.emitParticleAt(v.x + x, v.y + y, 1);
          } else {
            call.car.setRotation(0);
          }
          if (crash && call.label !== "429" && x > -30 && x < 90) y += call.lane === 0 ? -28 : 28;
          call.car.setPosition(x, y).setAlpha(0.52 + p * 0.48);
        });
        limiter.setText(crash ? "Rate limiter engaged\ntraffic reorganized" : p > 0.08 ? "250+ APIs Built" : "");
      },
    };
  }

  private createAchievementMountain(): Vignette {
    const v = { id: "achievement-mountain", x: 8100, y: 6000, radius: 780 };
    const c = this.container(v.x, v.y, 50);
    this.floorDecal(c, 500, 760, YELLOW, 0.14, 0);
    this.worldLabel(v.x, v.y - 360, "Achievement Mountain");
    const tiers = [
      { label: "Intern", x: -150, y: 245, color: 0x93a0b6 },
      { label: "Backend Developer", x: -60, y: 92, color: BLUE },
      { label: "Senior Developer", x: 40, y: -70, color: GREEN },
      { label: "Backend Lead", x: 125, y: -235, color: PURPLE },
    ].map((tier) => {
      const step = this.scene.add.container(tier.x, tier.y);
      const glow = this.scene.add.image(0, 0, "glow").setTint(tier.color).setBlendMode(Phaser.BlendModes.ADD).setScale(0.72, 0.42).setAlpha(0.24);
      step.add(glow);
      step.add(this.scene.add.rectangle(0, 0, 210, 58, tier.color, 0.78).setStrokeStyle(2, INK));
      step.add(this.scene.add.text(0, 0, tier.label, { fontFamily: FONT, fontSize: "13px", color: "#ffffff" }).setOrigin(0.5));
      c.add(step);
      return { ...tier, step, lit: false };
    });
    const line = this.scene.add.graphics();
    line.lineStyle(8, 0x6f7888, 0.55);
    line.beginPath();
    line.moveTo(-150, 245);
    line.lineTo(-60, 92);
    line.lineTo(40, -70);
    line.lineTo(125, -235);
    line.strokePath();
    c.addAt(line, 0);
    return {
      ...v,
      update: (ctx) => {
        tiers.forEach((tier) => {
          const wx = v.x + tier.x;
          const wy = v.y + tier.y;
          const d = dist(ctx.carX, ctx.carY, wx, wy);
          const p = clamp01(1 - d / 220);
          tier.step.setScale(1 + p * 0.12);
          tier.step.setAlpha(0.72 + p * 0.28);
          if (d < 150 && !tier.lit) {
            tier.lit = true;
            this.notice(wx, wy - 56, tier.label, "#20242c");
            this.sparks.emitParticleAt(wx, wy, 18);
          }
        });
      },
    };
  }

  private createCareerTrain(): Vignette {
    const v = { id: "career-railway", x: 4800, y: 1400, radius: 700 };
    const c = this.container(v.x, v.y, 55);
    this.floorDecal(c, 680, 220, BLUE, 0.18, 38);
    this.worldLabel(v.x, v.y - 165, "Career Timeline Railway");
    const track = this.scene.add.graphics();
    track.lineStyle(8, 0x59606f, 0.8);
    track.beginPath();
    track.moveTo(-300, 52);
    track.lineTo(310, 52);
    track.strokePath();
    for (let x = -280; x <= 280; x += 48) {
      track.lineStyle(4, 0x8a7a66, 0.7);
      track.beginPath();
      track.moveTo(x, 35);
      track.lineTo(x + 20, 68);
      track.strokePath();
    }
    c.add(track);
    const train = this.scene.add.container(-440, -2);
    const cars = [
      ["2021", "first APIs"],
      ["2022", "backend systems"],
      ["2024", "SaaS platforms"],
      ["2026", "AI lead"],
    ].map((pair, i) => {
      const car = this.scene.add.container(-185 + i * 124, 0);
      car.add(this.scene.add.rectangle(0, 0, 112, 74, i % 2 ? 0x2f6df0 : 0x1fb6c9, 0.94).setStrokeStyle(2, INK));
      car.add(this.scene.add.text(0, -14, pair[0], { fontFamily: FONT, fontSize: "15px", color: "#ffffff" }).setOrigin(0.5));
      car.add(this.scene.add.text(0, 14, pair[1], { fontFamily: FONT, fontSize: "10px", color: "#ffffff", align: "center" }).setOrigin(0.5));
      train.add(car);
      return car;
    });
    c.add(train);
    const hint = this.localText(c, 0, 104, "", 13, "#20242c");
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        train.x += ((p > 0.05 ? 0 : -440) - train.x) * Math.min(1, ctx.delta * 0.006);
        cars.forEach((car, i) => car.setY(Math.sin(ctx.time * 0.004 + i) * 3));
        hint.setText(p > 0.12 ? "Each carriage is a year. Drive alongside the work." : "");
      },
    };
  }

  private createResumeMuseum(): Vignette {
    const v = { id: "resume-museum", x: 8050, y: 1000, radius: 650 };
    const c = this.container(v.x, v.y, 58);
    this.floorDecal(c, 450, 300, ORANGE, 0.22, 12);
    this.worldLabel(v.x, v.y - 165, "Interactive Resume Museum");
    this.rounded(c, 0, 0, 360, 230, 0xe9e0cf, 0.86, 0x8f6438);
    const deskShadow = this.scene.add.ellipse(0, 50, 250, 76, 0x151922, 0.12);
    const desk = this.scene.add.rectangle(0, 12, 220, 88, 0xc08a55, 0.95).setStrokeStyle(2, INK);
    const laptopGlow = this.scene.add.image(-56, -4, "glow").setTint(GREEN).setBlendMode(Phaser.BlendModes.ADD).setScale(0.42).setAlpha(0.26);
    const laptop = this.scene.add.rectangle(-56, -4, 76, 48, 0x202631, 1).setStrokeStyle(2, GREEN, 0.64);
    const laptopSheen = this.scene.add.rectangle(-66, -17, 32, 3, 0xffffff, 0.2);
    const mug = this.scene.add.circle(72, -12, 18, 0xf4ede0, 1).setStrokeStyle(2, INK);
    const notebook = this.scene.add.rectangle(38, 28, 70, 40, 0xf2e6cf, 1).setStrokeStyle(2, INK);
    const sleepingBag = this.scene.add.rectangle(-128, 88, 70, 32, 0x7b5cff, 0.78).setStrokeStyle(2, INK);
    const duck = this.scene.add.image(133, 76, "col-duck").setScale(1.1);
    const graph = this.scene.add.container(0, -86);
    graph.add(this.scene.add.rectangle(0, 0, 210, 54, 0xf4ede0, 0.92).setStrokeStyle(2, 0x4c9a6a, 0.58));
    for (let i = 0; i < 48; i++) {
      const col = i % 16;
      const row = Math.floor(i / 16);
      graph.add(this.scene.add.rectangle(-90 + col * 12, -16 + row * 12, 8, 8, [0xcfe3bf, 0x4ce0a0, 0x236342][(i * 7) % 3], 0.85));
    }
    const terminal = this.localText(c, -56, 58, "", 10, "#4ce0a0");
    c.add([deskShadow, desk, laptopGlow, laptop, laptopSheen, mug, notebook, sleepingBag, duck, graph]);

    const items = [
      { id: "coffee", x: 72, y: -12, r: 54, text: "Coffee: Productivity", value: 25 },
      { id: "night-shift", x: -128, y: 88, r: 62, text: "Night Shift Survivor", value: 15 },
      { id: "debug-duck", x: 133, y: 76, r: 60, text: "Debugging Companion Found", value: 15 },
    ];
    return {
      ...v,
      update: (ctx) => {
        const laptopP = clamp01(1 - dist(ctx.carX, ctx.carY, v.x - 56, v.y - 4) / 170);
        terminal.setText(laptopP > 0.1 ? "npm install...\nstill installing..." : "");
        laptop.setScale(1 + laptopP * 0.12);
        mug.setScale(1 + Math.sin(ctx.time * 0.006) * 0.04);
        graph.setY(-86 + Math.sin(ctx.time * 0.002) * 3);
        for (const item of items) {
          const wx = v.x + item.x;
          const wy = v.y + item.y;
          if (dist(ctx.carX, ctx.carY, wx, wy) < item.r) this.awardOnce(item.id, item.value, wx, wy - 20, item.text);
        }
      },
    };
  }

  private createSkillTemple(): Vignette {
    const v = { id: "skill-temple", x: 8800, y: 2000, radius: 680 };
    const c = this.container(v.x, v.y, 57);
    this.floorDecal(c, 470, 320, PURPLE, 0.24, 8);
    this.worldLabel(v.x, v.y - 165, "Skill Temple");
    const skills = ["Node.js", "Python", "Express", "Docker", "AI", "Postgres", "AWS", "Redis"];
    const lightning = this.scene.add.graphics();
    c.add(lightning);
    const code = this.localText(c, 0, 124, "touch a pillar", 13, "#20242c");
    const centerOrb = this.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.85).setAlpha(0.28);
    c.add(centerOrb);
    const pillars = skills.map((skill, i) => {
      const a = (i / skills.length) * Math.PI * 2;
      const x = Math.cos(a) * 150;
      const y = Math.sin(a) * 86;
      const pillar = this.scene.add.container(x, y);
      pillar.add(this.scene.add.image(0, 0, "glow").setTint([BLUE, GREEN, PURPLE, ORANGE][i % 4]).setBlendMode(Phaser.BlendModes.ADD).setScale(0.42).setAlpha(0.18));
      pillar.add(this.scene.add.rectangle(0, 0, 62, 74, i % 2 ? 0x39414f : 0x5a6170, 0.95).setStrokeStyle(2, INK));
      pillar.add(this.scene.add.circle(0, -38, 24, [BLUE, GREEN, PURPLE, ORANGE][i % 4], 0.9).setStrokeStyle(2, INK));
      pillar.add(this.scene.add.text(0, 50, skill, { fontFamily: FONT, fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 }).setOrigin(0.5));
      c.add(pillar);
      return { skill, pillar, x, y, active: false };
    });
    return {
      ...v,
      update: (ctx) => {
        let activeSkill = "";
        lightning.clear();
        centerOrb.setRotation(ctx.time * 0.001).setAlpha(0.24 + Math.sin(ctx.time * 0.004) * 0.08);
        pillars.forEach((p, i) => {
          const wx = v.x + p.x;
          const wy = v.y + p.y;
          const near = dist(ctx.carX, ctx.carY, wx, wy) < 94;
          p.pillar.setScale(near ? 1.18 + Math.sin(ctx.time * 0.012) * 0.04 : 1);
          p.pillar.setRotation(near ? Math.sin(ctx.time * 0.012 + i) * 0.08 : 0);
          if (near) {
            activeSkill = p.skill;
            lightning.lineStyle(4, [BLUE, GREEN, PURPLE, ORANGE][i % 4], 0.85);
            lightning.beginPath();
            lightning.moveTo(0, 0);
            lightning.lineTo(p.x * 0.35, p.y * 0.35 - 24);
            lightning.lineTo(p.x * 0.72, p.y * 0.72 + 12);
            lightning.lineTo(p.x, p.y);
            lightning.strokePath();
            if (!p.active) {
              p.active = true;
              this.sparks.emitParticleAt(wx, wy, 24);
            }
          } else {
            p.active = false;
          }
        });
        code.setText(activeSkill ? `${activeSkill} unlocked\nservice code orbiting` : "touch a pillar");
      },
    };
  }

  private createVoiceAiDemo(): Vignette {
    const v = { id: "voice-ai-demo", x: 2100, y: 6550, radius: 650 };
    const c = this.container(v.x, v.y, 66);
    this.floorDecal(c, 410, 260, PURPLE, 0.3, 12);
    this.worldLabel(v.x, v.y - 160, "Voice AI Demo");
    const npcGlow = this.scene.add.image(-92, -12, "glow").setTint(ORANGE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.5).setAlpha(0.3);
    const vishuGlow = this.scene.add.image(92, -12, "glow").setTint(BLUE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.5).setAlpha(0.3);
    const npc = this.scene.add.circle(-92, -12, 28, 0xf2d199, 1).setStrokeStyle(2, INK);
    const vishu = this.scene.add.circle(92, -12, 28, 0x9fc4e2, 1).setStrokeStyle(2, INK);
    const waveG = this.scene.add.graphics();
    const transcript = this.localText(c, 0, 78, "waiting for voice", 13, "#20242c");
    const pipeline = this.localText(c, 0, 120, "STT -> LLM -> TTS", 12, "#5a3cff");
    c.add([npcGlow, vishuGlow, npc, vishu, waveG]);
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 150);
        waveG.clear();
        waveG.lineStyle(3, PURPLE, 0.25 + p * 0.65);
        for (let i = 0; i < 18; i++) {
          const x = -48 + i * 6;
          const h = (8 + Math.sin(ctx.time * 0.012 + i) * 18) * p;
          waveG.beginPath();
          waveG.moveTo(x, -12 - h);
          waveG.lineTo(x, -12 + h);
          waveG.strokePath();
        }
        const phase = Math.floor((ctx.time / 2200) % 4);
        const lines = ["NPC: Hello Vishu", "Vishu AI: Hi. Routing call.", "Function: check_context()", "Reply: backend lead, AI engineer"];
        transcript.setText(p > 0.1 ? lines[phase] : "waiting for voice");
        pipeline.setAlpha(0.3 + p * 0.7);
        npc.setScale(1 + (phase === 0 ? p * 0.12 : 0));
        vishu.setScale(1 + (phase === 3 ? p * 0.12 : 0));
      },
    };
  }

  private createDatabaseVault(): Vignette {
    const v = { id: "database-vault", x: 4250, y: 6550, radius: 650 };
    const c = this.container(v.x, v.y, 68);
    this.floorDecal(c, 420, 280, BLUE, 0.28, 10);
    this.worldLabel(v.x, v.y - 160, "Database Vault");
    this.rounded(c, 0, 0, 300, 210, 0x26313a, 0.94, 0x6a98bd);
    const door = this.scene.add.container(-78, 0);
    door.add(this.scene.add.image(0, 0, "glow").setTint(BLUE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.86).setAlpha(0.32));
    door.add(this.scene.add.circle(0, 0, 66, 0x9fc4e2, 0.95).setStrokeStyle(4, INK));
    door.add(this.scene.add.circle(0, 0, 32, 0x39414f, 1).setStrokeStyle(3, INK));
    door.add(this.scene.add.rectangle(0, 0, 94, 8, 0xf4ede0, 0.85));
    const rows = Array.from({ length: 6 }, (_, i) => {
      const row = this.scene.add.rectangle(70, -64 + i * 24, 112, 14, i === 3 ? RED : GREEN, 0.78).setStrokeStyle(1, INK);
      c.add(row);
      return row;
    });
    const status = this.localText(c, 55, 90, "password required", 13, "#dbe6ef");
    c.add(door);
    let repaired = 0;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 150);
        door.setX(-78 - p * 54).setRotation(-p * 0.55);
        rows.forEach((r) => r.setAlpha(p));
        if (p > 0.5 && repaired < 1) repaired = Math.min(1, repaired + ctx.delta / 3200);
        rows[3].setFillStyle(repaired >= 1 ? GREEN : RED, repaired >= 1 ? 0.78 : 0.9);
        status.setText(p < 0.18 ? "password required" : repaired < 1 ? `repairing table ${Math.floor(repaired * 100)}%` : "Recovered Database");
        status.setColor(repaired >= 1 ? "#4ce0a0" : "#dbe6ef");
      },
    };
  }

  /** bnbMEhome: watch a booking travel guest → calendar → key → invoice */
  private createHotelBooking(): Vignette {
    const v = { id: "hotel-booking", x: 8550, y: 2800, radius: 620 };
    const c = this.container(v.x, v.y, 60);
    this.floorDecal(c, 420, 250, ORANGE, 0.24, 10);
    this.worldLabel(v.x, v.y - 150, "Live Booking Flow");
    const stops = [
      { x: -160, label: "guest" },
      { x: -53, label: "calendar" },
      { x: 53, label: "webhook" },
      { x: 160, label: "invoice" },
    ];
    const lane = this.scene.add.graphics();
    lane.lineStyle(5, 0xf0994b, 0.4);
    lane.beginPath();
    lane.moveTo(-160, 0);
    lane.lineTo(160, 0);
    lane.strokePath();
    c.add(lane);
    stops.forEach((s) => {
      this.screenPanel(c, s.x, 0, 72, 52, ORANGE, 0.94);
      this.localText(c, s.x, 40, s.label, 10, "#20242c");
    });
    const guest = this.scene.add.circle(-160, -44, 12, 0xf2d199, 1).setStrokeStyle(2, INK);
    const calGrid = this.localText(c, -53, -4, "MO TU WE\n□  ■  □", 9, "#ffd9a0");
    const hook = this.localText(c, 53, -4, "POST 200", 9, "#4ce0a0");
    const invoice = this.localText(c, 160, -4, "₹ 4,200", 10, "#ffd9a0");
    const status = this.localText(c, 0, 96, "", 12, "#20242c");
    c.add(guest);
    let doneAt = -1;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        const phase = p > 0.06 ? (ctx.time % 8000) / 8000 : 0;
        guest.setPosition(-160 + Phaser.Math.Easing.Sine.InOut(Math.min(1, phase * 1.4)) * 320, -44);
        calGrid.setText(phase > 0.3 ? "MO TU WE\n□  ✔  □" : "MO TU WE\n□  ■  □");
        hook.setAlpha(phase > 0.55 ? 1 : 0.3);
        invoice.setAlpha(phase > 0.8 ? 1 : 0.25);
        if (phase > 0.8 && ctx.time - doneAt > 8000) {
          doneAt = ctx.time;
          this.sparks.emitParticleAt(v.x + 160, v.y - 20, 10);
        }
        status.setText(
          p < 0.06
            ? ""
            : phase < 0.3
              ? "guest picks a room…"
              : phase < 0.55
                ? "availability locked"
                : phase < 0.8
                  ? "payment webhook fires"
                  : "invoice generated ✓"
        );
      },
    };
  }

  /** MetaOS: messages fan out through a queue into workers */
  private createBroadcastQueue(): Vignette {
    const v = { id: "broadcast-queue", x: 3900, y: 6500, radius: 620 };
    const c = this.container(v.x, v.y, 60);
    this.floorDecal(c, 430, 260, BLUE, 0.24, 10);
    this.worldLabel(v.x, v.y - 152, "Broadcast Pipeline");
    this.screenPanel(c, -140, 0, 84, 60, BLUE, 0.94);
    this.localText(c, -140, 46, "campaign", 10, "#20242c");
    const queue = this.screenPanel(c, 0, 0, 66, 96, YELLOW, 0.94);
    this.localText(c, 0, 66, "queue", 10, "#20242c");
    const workers = [-58, 0, 58].map((y) => {
      this.screenPanel(c, 150, y, 70, 44, GREEN, 0.94);
      return { y, busy: 0 };
    });
    this.localText(c, 150, 92, "workers", 10, "#20242c");
    const depth = this.localText(c, 0, -66, "depth 0", 10, "#f2b843");
    const sent = this.localText(c, 0, 112, "", 12, "#20242c");
    const dots = Array.from({ length: 6 }, (_, i) => {
      const d = this.scene.add.circle(0, 0, 5, 0x9fc4e2, 0.95).setStrokeStyle(1, INK);
      c.add(d);
      return { d, offset: i / 6 };
    });
    let delivered = 0;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        queue.setFillStyle(PANEL, 0.96);
        dots.forEach((dot, i) => {
          const t = ((ctx.time * 0.00022 + dot.offset) % 1) * (p > 0.06 ? 1 : 0);
          if (t < 0.45) {
            // campaign -> queue
            dot.d.setPosition(-140 + (t / 0.45) * 140, Math.sin(t * 9) * 8);
          } else {
            // queue -> a worker lane
            const k = (t - 0.45) / 0.55;
            const lane = workers[i % 3].y;
            dot.d.setPosition(k * 150, lane * k);
          }
          dot.d.setAlpha(p > 0.06 ? 0.95 : 0);
          if (t > 0.97) delivered++;
        });
        depth.setText(`depth ${Math.round(2 + Math.sin(ctx.time * 0.001) * 2 + p * 4)}`);
        sent.setText(p > 0.1 ? `${(24000 + (delivered % 9000)).toLocaleString()} messages delivered` : "");
      },
    };
  }

  /** Aaxel: invoices pair with bank lines — green ties, red orphans */
  private createReconciliation(): Vignette {
    const v = { id: "bank-reconciliation", x: 2600, y: 4600, radius: 620 };
    const c = this.container(v.x, v.y, 60);
    this.floorDecal(c, 420, 270, GREEN, 0.22, 10);
    this.worldLabel(v.x, v.y - 158, "AI Reconciliation Desk");
    this.localText(c, -110, -104, "invoices", 10, "#20242c");
    this.localText(c, 110, -104, "bank feed", 10, "#20242c");
    const rows = [-70, -35, 0, 35, 70];
    const left = rows.map((y, i) => {
      const r = this.scene.add.rectangle(-110, y, 96, 22, 0x39414f, 0.95).setStrokeStyle(1, INK);
      c.add(r);
      this.localText(c, -110, y, `INV-${310 + i}`, 9, "#dbe6ef");
      return r;
    });
    rows.forEach((y, i) => {
      const r = this.scene.add.rectangle(110, y, 96, 22, 0x2a303b, 0.95).setStrokeStyle(1, INK);
      c.add(r);
      this.localText(c, 110, y, i === 3 ? "UPI ???" : `TXN-${88 + i}`, 9, "#dbe6ef");
      return r;
    });
    const ties = this.scene.add.graphics();
    c.add(ties);
    const status = this.localText(c, 0, 112, "", 12, "#20242c");
    // row 3 is the unmatched one the AI flags
    const matchOrder = [0, 2, 1, 4];
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 160);
        const phase = p > 0.06 ? Math.min(1, ((ctx.time % 9000) / 9000) * 1.3) : 0;
        const matched = Math.floor(phase * (matchOrder.length + 1));
        ties.clear();
        matchOrder.slice(0, matched).forEach((row) => {
          ties.lineStyle(3, GREEN, 0.85);
          ties.beginPath();
          ties.moveTo(-62, rows[row]);
          ties.lineTo(62, rows[row]);
          ties.strokePath();
        });
        left.forEach((r, i) => r.setFillStyle(matchOrder.slice(0, matched).includes(i) ? 0x2c5443 : 0x39414f, 0.95));
        if (matched > matchOrder.length - 1 && phase > 0.9) {
          ties.lineStyle(3, RED, 0.9);
          ties.strokeCircle(110, rows[3], 18);
        }
        status.setText(
          p < 0.06
            ? ""
            : matched === 0
              ? "AI matching transactions…"
              : matched <= matchOrder.length
                ? `${matched}/5 matched`
                : "4 matched · 1 flagged for review"
        );
      },
    };
  }

  private createSecret(id: string, x: number, y: number, title: string, detail: string, color: number): Vignette {
    const v = { id, x, y, radius: 360 };
    const c = this.container(x, y, 90);
    this.floorDecal(c, 210, 150, color, 0.18, 0);
    const glow = this.scene.add.image(0, 0, "glow").setTint(color).setBlendMode(Phaser.BlendModes.ADD).setScale(1.3).setAlpha(0);
    const hatchShadow = this.scene.add.ellipse(0, 16, 144, 70, 0x151922, 0);
    const hatch = this.scene.add.rectangle(0, 0, 118, 78, 0x202631, 0).setStrokeStyle(2, color, 0);
    const titleText = this.localText(c, 0, -10, title, 13, "#f4ede0");
    const detailText = this.localText(c, 0, 24, detail, 10, "#dbe6ef");
    titleText.setAlpha(0);
    detailText.setAlpha(0);
    c.add([glow, hatchShadow, hatch]);
    let found = false;
    return {
      ...v,
      update: (ctx) => {
        const p = this.proximity(ctx, v, 80);
        glow.setAlpha(p * 0.85);
        hatchShadow.setAlpha(p * 0.22);
        hatch.setFillStyle(0x202631, p * 0.9);
        hatch.setStrokeStyle(2, color, p);
        titleText.setAlpha(p);
        detailText.setAlpha(p);
        c.setScale(1 + Math.sin(ctx.time * 0.004) * 0.03 * p);
        if (p > 0.7 && !found) {
          found = true;
          this.awardOnce(`secret-${id}`, 30, x, y - 70, title);
        }
      },
    };
  }
}
