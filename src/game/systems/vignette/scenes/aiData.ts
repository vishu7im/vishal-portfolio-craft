import Phaser from "phaser";
import {
  type Vignette,
  type VignetteKit,
  clamp01,
  dist,
  INK,
  GREEN,
  BLUE,
  PURPLE,
  ORANGE,
  RED,
} from "../VignetteKit";

export function createAiLab(k: VignetteKit): Vignette {
  const v = { id: "ai-lab", x: 900, y: 5450, radius: 760 };
  const c = k.container(v.x, v.y, 65);
  k.floorDecal(c, 470, 300, PURPLE, 0.42, 12);
  k.rounded(c, 0, 0, 330, 220, 0x251f48, 0.9, 0x8c7cff);
  k.worldLabel(v.x, v.y - 170, "AI Laboratory");

  k.screenPanel(c, 0, 55, 260, 70, PURPLE, 0.92);
  const leftRoof = k.scene.add.rectangle(-72, -20, 145, 178, 0x716c91, 1).setStrokeStyle(2, 0x2a2547, 0.85);
  const rightRoof = k.scene.add.rectangle(72, -20, 145, 178, 0x5c587a, 1).setStrokeStyle(2, 0x2a2547, 0.85);
  const roofLines = [-1, 1].map((side) => {
    const g = k.scene.add.graphics();
    g.lineStyle(2, 0xded6ff, 0.18);
    for (let yy = -82; yy <= 48; yy += 26) {
      g.beginPath();
      g.moveTo(side * 16, yy);
      g.lineTo(side * 130, yy - side * 16);
      g.strokePath();
    }
    return g;
  });
  const armG = k.scene.add.graphics();
  const brain = k.scene.add.container(0, -36);
  const brainGlow = k.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(1.25);
  const brainCore = k.scene.add.circle(0, 0, 36, PURPLE, 0.72).setStrokeStyle(2, 0xded6ff, 0.95);
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return k.scene.add.circle(Math.cos(a) * 25, Math.sin(a) * 18, 3.8, 0xffffff, 0.95);
  });
  brain.add([brainGlow, brainCore, ...nodes]);

  const waveRings = [0, 1, 2].map((i) =>
    k.scene.add.ellipse(0, -36, 108 + i * 28, 48 + i * 16).setStrokeStyle(2, 0xcfc6ff, 0)
  );
  const tags = ["Voice AI", "Realtime", "OpenAI", "Twilio", "Tools"].map((label, i) =>
    k.chip(c, -140 + i * 70, 112, label, PURPLE, i === 0 ? 78 : 66)
  );

  const screen = k.localText(c, 0, 48, "STT -> LLM -> TTS", 13, "#4ce0a0");
  c.add([leftRoof, rightRoof, ...roofLines, armG, ...waveRings, brain]);

  let wasNear = false;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 210);
      const near = p > 0.08;
      if (near && !wasNear) k.notice(v.x, v.y - 215, "The roof opens. The lab boots itself.", "#5a3cff");
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

export function createAiTrainingArea(k: VignetteKit): Vignette {
  const v = { id: "ai-training", x: 1500, y: 6550, radius: 650 };
  const c = k.container(v.x, v.y, 64);
  k.floorDecal(c, 420, 270, PURPLE, 0.36, 6);
  k.worldLabel(v.x, v.y - 165, "AI Training Area");
  const core = k.scene.add.circle(0, 0, 44, PURPLE, 0.85).setStrokeStyle(3, 0xded6ff);
  const coreRing = k.scene.add.ellipse(0, 0, 118, 76).setStrokeStyle(2, 0xded6ff, 0.45);
  const glow = k.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(1.4);
  const status = k.localText(c, 0, 92, "Training idle", 14, "#20242c");
  c.add([glow, coreRing, core]);
  const particles = Array.from({ length: 54 }, (_, i) => {
    const dot = k.scene.add.circle(0, 0, 3 + (i % 3), i % 2 ? 0xded6ff : 0x4ce0a0, 0.95);
    c.add(dot);
    return { dot, a: (i / 54) * Math.PI * 2, r: 92 + (i % 7) * 13, speed: 0.0015 + (i % 5) * 0.00035 };
  });
  let start = -1;
  let deployed = false;

  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
      if (p > 0.12 && start < 0) {
        start = ctx.time;
        k.notice(v.x, v.y - 208, "Particles collapse into a training run.", "#5a3cff");
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
          k.confetti.emitParticleAt(v.x, v.y - 40, 24);
        }
      }
    },
  };
}

export function createDataPipelineRiver(k: VignetteKit): Vignette {
  const v = { id: "data-pipeline", x: 1150, y: 4550, radius: 650 };
  const c = k.container(v.x, v.y, 66);
  k.floorDecal(c, 560, 250, BLUE, 0.22, 12);
  k.worldLabel(v.x, v.y - 155, "Data Pipeline River");
  const pipe = k.scene.add.graphics();
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
  const breakSpot = k.scene.add.circle(78, 28, 22, RED, 0.7).setStrokeStyle(2, INK);
  const malformed = k.localText(c, 88, 88, "{bad json", 11, "#e04f3f");
  const status = k.localText(c, 0, 126, "ETL flowing", 13, "#20242c");
  c.add(breakSpot);
  const records = ["{user}", "{order}", "{event}", "{vector}", "{invoice}", "{agent}"].map((label, i) => {
    const t = k.localText(c, 0, 0, label, 10, "#20242c");
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
      if (nearBreak && !fixed) k.sparks.emitParticleAt(v.x + 78, v.y + 28, 1);
    },
  };
}

export function createVoiceAiDemo(k: VignetteKit): Vignette {
  const v = { id: "voice-ai-demo", x: 2100, y: 6550, radius: 650 };
  const c = k.container(v.x, v.y, 66);
  k.floorDecal(c, 410, 260, PURPLE, 0.3, 12);
  k.worldLabel(v.x, v.y - 160, "Voice AI Demo");
  const npcGlow = k.scene.add.image(-92, -12, "glow").setTint(ORANGE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.5).setAlpha(0.3);
  const vishuGlow = k.scene.add.image(92, -12, "glow").setTint(BLUE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.5).setAlpha(0.3);
  const npc = k.scene.add.circle(-92, -12, 28, 0xf2d199, 1).setStrokeStyle(2, INK);
  const vishu = k.scene.add.circle(92, -12, 28, 0x9fc4e2, 1).setStrokeStyle(2, INK);
  const waveG = k.scene.add.graphics();
  const transcript = k.localText(c, 0, 78, "waiting for voice", 13, "#20242c");
  const pipeline = k.localText(c, 0, 120, "STT -> LLM -> TTS", 12, "#5a3cff");
  c.add([npcGlow, vishuGlow, npc, vishu, waveG]);
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 150);
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

export function createDatabaseVault(k: VignetteKit): Vignette {
  const v = { id: "database-vault", x: 4250, y: 6550, radius: 650 };
  const c = k.container(v.x, v.y, 68);
  k.floorDecal(c, 420, 280, BLUE, 0.28, 10);
  k.worldLabel(v.x, v.y - 160, "Database Vault");
  k.rounded(c, 0, 0, 300, 210, 0x26313a, 0.94, 0x6a98bd);
  const door = k.scene.add.container(-78, 0);
  door.add(k.scene.add.image(0, 0, "glow").setTint(BLUE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.86).setAlpha(0.32));
  door.add(k.scene.add.circle(0, 0, 66, 0x9fc4e2, 0.95).setStrokeStyle(4, INK));
  door.add(k.scene.add.circle(0, 0, 32, 0x39414f, 1).setStrokeStyle(3, INK));
  door.add(k.scene.add.rectangle(0, 0, 94, 8, 0xf4ede0, 0.85));
  const rows = Array.from({ length: 6 }, (_, i) => {
    const row = k.scene.add.rectangle(70, -64 + i * 24, 112, 14, i === 3 ? RED : GREEN, 0.78).setStrokeStyle(1, INK);
    c.add(row);
    return row;
  });
  const status = k.localText(c, 55, 90, "password required", 13, "#dbe6ef");
  c.add(door);
  let repaired = 0;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 150);
      door.setX(-78 - p * 54).setRotation(-p * 0.55);
      rows.forEach((r) => r.setAlpha(p));
      if (p > 0.5 && repaired < 1) repaired = Math.min(1, repaired + ctx.delta / 3200);
      rows[3].setFillStyle(repaired >= 1 ? GREEN : RED, repaired >= 1 ? 0.78 : 0.9);
      status.setText(p < 0.18 ? "password required" : repaired < 1 ? `repairing table ${Math.floor(repaired * 100)}%` : "Recovered Database");
      status.setColor(repaired >= 1 ? "#4ce0a0" : "#dbe6ef");
    },
  };
}
