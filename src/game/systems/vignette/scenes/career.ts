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
  YELLOW,
  FONT,
} from "../VignetteKit";

export function createOpenSourcePark(k: VignetteKit): Vignette {
  const v = { id: "open-source-park", x: 4150, y: 1950, radius: 620 };
  const c = k.container(v.x, v.y, 58);
  k.floorDecal(c, 360, 230, GREEN, 0.2, 16);
  k.worldLabel(v.x, v.y - 142, "Open Source Park");
  k.rounded(c, 0, 12, 250, 160, 0xcfe3bf, 0.75, 0x4c9a6a);
  const base = k.screenPanel(c, 0, 32, 150, 78, GREEN, 0.98);
  const lid = k.scene.add.rectangle(0, -32, 150, 18, 0x39414f, 1).setStrokeStyle(2, GREEN, 0.55);
  const terminal = k.localText(c, 0, 18, "", 11, "#4ce0a0");
  const stars = k.localText(c, 0, 82, "stars: 42", 13, "#20242c");
  c.add([base, lid]);
  let start = -1;

  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 150);
      if (p > 0.08 && start < 0) {
        start = ctx.time;
        k.notice(v.x, v.y - 185, "Laptop wakes up. Commits start landing.", "#236342");
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
      if (p > 0.15) k.codeBits.emitParticleAt(v.x, v.y - 30, 1);
    },
  };
}

export function createAchievementMountain(k: VignetteKit): Vignette {
  const v = { id: "achievement-mountain", x: 8100, y: 6000, radius: 780 };
  const c = k.container(v.x, v.y, 50);
  k.floorDecal(c, 500, 760, YELLOW, 0.14, 0);
  k.worldLabel(v.x, v.y - 360, "Achievement Mountain");
  const tiers = [
    { label: "Intern", x: -150, y: 245, color: 0x93a0b6 },
    { label: "Backend Developer", x: -60, y: 92, color: BLUE },
    { label: "Senior Developer", x: 40, y: -70, color: GREEN },
    { label: "Backend Lead", x: 125, y: -235, color: PURPLE },
  ].map((tier) => {
    const step = k.scene.add.container(tier.x, tier.y);
    const glow = k.scene.add.image(0, 0, "glow").setTint(tier.color).setBlendMode(Phaser.BlendModes.ADD).setScale(0.72, 0.42).setAlpha(0.24);
    step.add(glow);
    step.add(k.scene.add.rectangle(0, 0, 210, 58, tier.color, 0.78).setStrokeStyle(2, INK));
    step.add(k.scene.add.text(0, 0, tier.label, { fontFamily: FONT, fontSize: "13px", color: "#ffffff" }).setOrigin(0.5));
    c.add(step);
    return { ...tier, step, lit: false };
  });
  const line = k.scene.add.graphics();
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
          k.notice(wx, wy - 56, tier.label, "#20242c");
          k.sparks.emitParticleAt(wx, wy, 18);
        }
      });
    },
  };
}

export function createCareerTrain(k: VignetteKit): Vignette {
  const v = { id: "career-railway", x: 4800, y: 1400, radius: 700 };
  const c = k.container(v.x, v.y, 55);
  k.floorDecal(c, 680, 220, BLUE, 0.18, 38);
  k.worldLabel(v.x, v.y - 165, "Career Timeline Railway");
  const track = k.scene.add.graphics();
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
  const train = k.scene.add.container(-440, -2);
  const cars = [
    ["2021", "first APIs"],
    ["2022", "backend systems"],
    ["2024", "SaaS platforms"],
    ["2026", "AI lead"],
  ].map((pair, i) => {
    const car = k.scene.add.container(-185 + i * 124, 0);
    car.add(k.scene.add.rectangle(0, 0, 112, 74, i % 2 ? 0x2f6df0 : 0x1fb6c9, 0.94).setStrokeStyle(2, INK));
    car.add(k.scene.add.text(0, -14, pair[0], { fontFamily: FONT, fontSize: "15px", color: "#ffffff" }).setOrigin(0.5));
    car.add(k.scene.add.text(0, 14, pair[1], { fontFamily: FONT, fontSize: "10px", color: "#ffffff", align: "center" }).setOrigin(0.5));
    train.add(car);
    return car;
  });
  c.add(train);
  const hint = k.localText(c, 0, 104, "", 13, "#20242c");
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
      train.x += ((p > 0.05 ? 0 : -440) - train.x) * Math.min(1, ctx.delta * 0.006);
      cars.forEach((car, i) => car.setY(Math.sin(ctx.time * 0.004 + i) * 3));
      hint.setText(p > 0.12 ? "Each carriage is a year. Drive alongside the work." : "");
    },
  };
}

export function createResumeMuseum(k: VignetteKit): Vignette {
  const v = { id: "resume-museum", x: 8050, y: 1000, radius: 650 };
  const c = k.container(v.x, v.y, 58);
  k.floorDecal(c, 450, 300, ORANGE, 0.22, 12);
  k.worldLabel(v.x, v.y - 165, "Interactive Resume Museum");
  k.rounded(c, 0, 0, 360, 230, 0xe9e0cf, 0.86, 0x8f6438);
  const deskShadow = k.scene.add.ellipse(0, 50, 250, 76, 0x151922, 0.12);
  const desk = k.scene.add.rectangle(0, 12, 220, 88, 0xc08a55, 0.95).setStrokeStyle(2, INK);
  const laptopGlow = k.scene.add.image(-56, -4, "glow").setTint(GREEN).setBlendMode(Phaser.BlendModes.ADD).setScale(0.42).setAlpha(0.26);
  const laptop = k.scene.add.rectangle(-56, -4, 76, 48, 0x202631, 1).setStrokeStyle(2, GREEN, 0.64);
  const laptopSheen = k.scene.add.rectangle(-66, -17, 32, 3, 0xffffff, 0.2);
  const mug = k.scene.add.circle(72, -12, 18, 0xf4ede0, 1).setStrokeStyle(2, INK);
  const notebook = k.scene.add.rectangle(38, 28, 70, 40, 0xf2e6cf, 1).setStrokeStyle(2, INK);
  const sleepingBag = k.scene.add.rectangle(-128, 88, 70, 32, 0x7b5cff, 0.78).setStrokeStyle(2, INK);
  const duck = k.scene.add.image(133, 76, "col-duck").setScale(1.1);
  const graph = k.scene.add.container(0, -86);
  graph.add(k.scene.add.rectangle(0, 0, 210, 54, 0xf4ede0, 0.92).setStrokeStyle(2, 0x4c9a6a, 0.58));
  for (let i = 0; i < 48; i++) {
    const col = i % 16;
    const row = Math.floor(i / 16);
    graph.add(k.scene.add.rectangle(-90 + col * 12, -16 + row * 12, 8, 8, [0xcfe3bf, 0x4ce0a0, 0x236342][(i * 7) % 3], 0.85));
  }
  const terminal = k.localText(c, -56, 58, "", 10, "#4ce0a0");
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
        if (dist(ctx.carX, ctx.carY, wx, wy) < item.r) k.awardOnce(item.id, item.value, wx, wy - 20, item.text);
      }
    },
  };
}

export function createSkillTemple(k: VignetteKit): Vignette {
  const v = { id: "skill-temple", x: 8800, y: 2000, radius: 680 };
  const c = k.container(v.x, v.y, 57);
  k.floorDecal(c, 470, 320, PURPLE, 0.24, 8);
  k.worldLabel(v.x, v.y - 165, "Skill Temple");
  const skills = ["Node.js", "Python", "Express", "Docker", "AI", "Postgres", "AWS", "Redis"];
  const lightning = k.scene.add.graphics();
  c.add(lightning);
  const code = k.localText(c, 0, 124, "touch a pillar", 13, "#20242c");
  const centerOrb = k.scene.add.image(0, 0, "glow").setTint(PURPLE).setBlendMode(Phaser.BlendModes.ADD).setScale(0.85).setAlpha(0.28);
  c.add(centerOrb);
  const pillars = skills.map((skill, i) => {
    const a = (i / skills.length) * Math.PI * 2;
    const x = Math.cos(a) * 150;
    const y = Math.sin(a) * 86;
    const pillar = k.scene.add.container(x, y);
    pillar.add(k.scene.add.image(0, 0, "glow").setTint([BLUE, GREEN, PURPLE, ORANGE][i % 4]).setBlendMode(Phaser.BlendModes.ADD).setScale(0.42).setAlpha(0.18));
    pillar.add(k.scene.add.rectangle(0, 0, 62, 74, i % 2 ? 0x39414f : 0x5a6170, 0.95).setStrokeStyle(2, INK));
    pillar.add(k.scene.add.circle(0, -38, 24, [BLUE, GREEN, PURPLE, ORANGE][i % 4], 0.9).setStrokeStyle(2, INK));
    pillar.add(k.scene.add.text(0, 50, skill, { fontFamily: FONT, fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 }).setOrigin(0.5));
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
            k.sparks.emitParticleAt(wx, wy, 24);
          }
        } else {
          p.active = false;
        }
      });
      code.setText(activeSkill ? `${activeSkill} unlocked\nservice code orbiting` : "touch a pillar");
    },
  };
}
