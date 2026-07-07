import Phaser from "phaser";
import { gameStore } from "../../../state/gameStore";
import {
  type Vignette,
  type VignetteKit,
  dist,
  INK,
  GREEN,
  RED,
  YELLOW,
  ORANGE,
  FONT,
} from "../VignetteKit";

export function createBugSwamp(k: VignetteKit): Vignette {
  const v = { id: "bug-swamp", x: 2480, y: 2100, radius: 650 };
  const c = k.container(v.x, v.y, 40);
  k.floorDecal(c, 520, 310, GREEN, 0.22, 6);
  k.worldLabel(v.x, v.y - 170, "Bug Swamp");
  const pond = k.scene.add.graphics();
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
  const xp = k.localText(c, 0, 140, "Bug XP: 0", 13, "#20242c");

  const defs = [
    { name: "Memory Leak", color: RED, x: -145, y: -60, shape: "monster" },
    { name: "Race Condition", color: 0xded6ff, x: 120, y: -78, shape: "ghost" },
    { name: "Null Pointer", color: GREEN, x: -80, y: 78, shape: "slime" },
    { name: "Infinite Loop", color: YELLOW, x: 120, y: 72, shape: "tornado" },
  ];
  let score = 0;
  const bugs = defs.map((def, i) => {
    const body = k.scene.add.container(def.x, def.y);
    if (def.shape === "tornado") {
      const g = k.scene.add.graphics();
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
      body.add(k.scene.add.circle(0, 0, def.shape === "ghost" ? 22 : 25, def.color, 0.88).setStrokeStyle(2, INK));
      body.add(k.scene.add.circle(-8, -5, 3, INK, 1));
      body.add(k.scene.add.circle(8, -5, 3, INK, 1));
    }
    body.add(
      k.scene.add
        .text(0, 38, def.name, { fontFamily: FONT, fontSize: "10px", color: "#20242c", stroke: "#f4ede0", strokeThickness: 3 })
        .setOrigin(0.5)
    );
    c.add(body);
    return { ...def, body, alive: true, respawnAt: 0, index: i };
  });

  return {
    ...v,
    update: (ctx) => {
      k.proximity(ctx, v, 180);
      for (const bug of bugs) {
        if (!bug.alive && ctx.time > bug.respawnAt) {
          bug.alive = true;
          bug.body.setVisible(true).setScale(0.2);
          k.scene.tweens.add({ targets: bug.body, scale: 1, duration: 240, ease: "Back.out" });
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
          k.bugBits.emitParticleAt(wx, wy, 22);
          k.notice(wx, wy - 30, "Bug Fixed", "#236342");
          gameStore.addXp(5);
          gameStore.award("ach-first-bug");
        }
      }
    },
  };
}

/** bnbMEhome: watch a booking travel guest → calendar → key → invoice */
export function createHotelBooking(k: VignetteKit): Vignette {
  const v = { id: "hotel-booking", x: 8550, y: 2800, radius: 620 };
  const c = k.container(v.x, v.y, 60);
  k.floorDecal(c, 420, 250, ORANGE, 0.24, 10);
  k.worldLabel(v.x, v.y - 150, "Live Booking Flow");
  const stops = [
    { x: -160, label: "guest" },
    { x: -53, label: "calendar" },
    { x: 53, label: "webhook" },
    { x: 160, label: "invoice" },
  ];
  const lane = k.scene.add.graphics();
  lane.lineStyle(5, 0xf0994b, 0.4);
  lane.beginPath();
  lane.moveTo(-160, 0);
  lane.lineTo(160, 0);
  lane.strokePath();
  c.add(lane);
  stops.forEach((s) => {
    k.screenPanel(c, s.x, 0, 72, 52, ORANGE, 0.94);
    k.localText(c, s.x, 40, s.label, 10, "#20242c");
  });
  const guest = k.scene.add.circle(-160, -44, 12, 0xf2d199, 1).setStrokeStyle(2, INK);
  const calGrid = k.localText(c, -53, -4, "MO TU WE\n□  ■  □", 9, "#ffd9a0");
  const hook = k.localText(c, 53, -4, "POST 200", 9, "#4ce0a0");
  const invoice = k.localText(c, 160, -4, "₹ 4,200", 10, "#ffd9a0");
  const status = k.localText(c, 0, 96, "", 12, "#20242c");
  c.add(guest);
  let doneAt = -1;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
      const phase = p > 0.06 ? (ctx.time % 8000) / 8000 : 0;
      guest.setPosition(-160 + Phaser.Math.Easing.Sine.InOut(Math.min(1, phase * 1.4)) * 320, -44);
      calGrid.setText(phase > 0.3 ? "MO TU WE\n□  ✔  □" : "MO TU WE\n□  ■  □");
      hook.setAlpha(phase > 0.55 ? 1 : 0.3);
      invoice.setAlpha(phase > 0.8 ? 1 : 0.25);
      if (phase > 0.8 && ctx.time - doneAt > 8000) {
        doneAt = ctx.time;
        k.sparks.emitParticleAt(v.x + 160, v.y - 20, 10);
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

/** Aaxel: invoices pair with bank lines — green ties, red orphans */
export function createReconciliation(k: VignetteKit): Vignette {
  const v = { id: "bank-reconciliation", x: 2600, y: 4600, radius: 620 };
  const c = k.container(v.x, v.y, 60);
  k.floorDecal(c, 420, 270, GREEN, 0.22, 10);
  k.worldLabel(v.x, v.y - 158, "AI Reconciliation Desk");
  k.localText(c, -110, -104, "invoices", 10, "#20242c");
  k.localText(c, 110, -104, "bank feed", 10, "#20242c");
  const rows = [-70, -35, 0, 35, 70];
  const left = rows.map((y, i) => {
    const r = k.scene.add.rectangle(-110, y, 96, 22, 0x39414f, 0.95).setStrokeStyle(1, INK);
    c.add(r);
    k.localText(c, -110, y, `INV-${310 + i}`, 9, "#dbe6ef");
    return r;
  });
  rows.forEach((y, i) => {
    const r = k.scene.add.rectangle(110, y, 96, 22, 0x2a303b, 0.95).setStrokeStyle(1, INK);
    c.add(r);
    k.localText(c, 110, y, i === 3 ? "UPI ???" : `TXN-${88 + i}`, 9, "#dbe6ef");
    return r;
  });
  const ties = k.scene.add.graphics();
  c.add(ties);
  const status = k.localText(c, 0, 112, "", 12, "#20242c");
  // row 3 is the unmatched one the AI flags
  const matchOrder = [0, 2, 1, 4];
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
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

export function createSecret(
  k: VignetteKit,
  id: string,
  x: number,
  y: number,
  title: string,
  detail: string,
  color: number
): Vignette {
  const v = { id, x, y, radius: 360 };
  const c = k.container(x, y, 90);
  k.floorDecal(c, 210, 150, color, 0.18, 0);
  const glow = k.scene.add.image(0, 0, "glow").setTint(color).setBlendMode(Phaser.BlendModes.ADD).setScale(1.3).setAlpha(0);
  const hatchShadow = k.scene.add.ellipse(0, 16, 144, 70, 0x151922, 0);
  const hatch = k.scene.add.rectangle(0, 0, 118, 78, 0x202631, 0).setStrokeStyle(2, color, 0);
  const titleText = k.localText(c, 0, -10, title, 13, "#f4ede0");
  const detailText = k.localText(c, 0, 24, detail, 10, "#dbe6ef");
  titleText.setAlpha(0);
  detailText.setAlpha(0);
  c.add([glow, hatchShadow, hatch]);
  let found = false;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 80);
      glow.setAlpha(p * 0.85);
      hatchShadow.setAlpha(p * 0.22);
      hatch.setFillStyle(0x202631, p * 0.9);
      hatch.setStrokeStyle(2, color, p);
      titleText.setAlpha(p);
      detailText.setAlpha(p);
      c.setScale(1 + Math.sin(ctx.time * 0.004) * 0.03 * p);
      if (p > 0.7 && !found) {
        found = true;
        k.awardOnce(`secret-${id}`, 30, x, y - 70, title);
      }
    },
  };
}
