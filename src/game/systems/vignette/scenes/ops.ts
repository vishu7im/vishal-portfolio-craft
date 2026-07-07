import Phaser from "phaser";
import {
  type Vignette,
  type VignetteKit,
  clamp01,
  INK,
  PAPER,
  PANEL,
  PANEL_2,
  GREEN,
  BLUE,
  ORANGE,
  YELLOW,
  RED,
  FONT,
} from "../VignetteKit";

export function createProductionIncident(k: VignetteKit): Vignette {
  const v = { id: "production-server", x: 4200, y: 5500, radius: 700 };
  const c = k.container(v.x, v.y, 70);
  k.floorDecal(c, 440, 285, BLUE, 0.34, 12);
  k.rounded(c, 0, 0, 330, 220, 0x202631, 0.92, 0x6a98bd);
  k.worldLabel(v.x, v.y - 165, "Production Server");

  const racks = Array.from({ length: 5 }, (_, i) => {
    const rack = k.screenPanel(c, -120 + i * 60, -24, 44, 130, i === 1 ? GREEN : BLUE, 0.96);
    c.add(rack);
    for (let j = 0; j < 5; j++) {
      const led = k.scene.add.circle(-136 + i * 60, -76 + j * 24, 3, j % 2 ? GREEN : BLUE, 0.9);
      c.add(led);
    }
    return rack;
  });
  const alarm = k.scene.add.rectangle(0, -102, 284, 18, RED, 0).setStrokeStyle(1, 0xffc2bd, 0.7);
  const fan = k.scene.add.star(128, 82, 6, 6, 26, 0xdbe6ef, 0.9).setStrokeStyle(1, INK);
  const fire = k.scene.add.triangle(-42, 35, 0, -28, 22, 24, -22, 24, ORANGE, 0.95).setVisible(false);
  const status = k.localText(c, 0, 92, "stable: latency 38ms", 13, "#4ce0a0");
  c.add([alarm, fan, fire]);

  let incidentStart = -20000;
  let exploded = false;
  let wasNear = false;

  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 180);
      const near = p > 0.08;
      if (near && (!wasNear || ctx.time - incidentStart > 18000)) {
        incidentStart = ctx.time;
        exploded = false;
        k.notice(v.x, v.y - 200, "Production Incident detected.", "#b02420");
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
        k.sparks.emitParticleAt(v.x - 42, v.y + 35, 32);
        k.smoke.emitParticleAt(v.x - 42, v.y + 28, 18);
      }
      if (active && t > 0.26 && t < 0.82) k.smoke.emitParticleAt(v.x - 42, v.y + 28, 2);

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

export function createDevOpsFactory(k: VignetteKit): Vignette {
  const v = { id: "devops-factory", x: 5400, y: 5500, radius: 730 };
  const c = k.container(v.x, v.y, 70);
  k.floorDecal(c, 500, 300, GREEN, 0.32, 12);
  k.rounded(c, 0, 0, 380, 230, 0x26313a, 0.91, 0x7fc9d8);
  k.worldLabel(v.x, v.y - 172, "DevOps Factory");

  k.screenPanel(c, -40, 10, 300, 54, GREEN, 0.96);
  const beltLines = Array.from({ length: 9 }, (_, i) =>
    k.scene.add.rectangle(-170 + i * 38, 10, 3, 52, 0x4ce0a0, 0.18)
  );
  const progressBg = k.scene.add.rectangle(-92, 94, 184, 12, 0x151922, 1).setOrigin(0, 0.5).setStrokeStyle(1, 0x59606f);
  const progressFill = k.scene.add.rectangle(-90, 94, 180, 8, GREEN, 0.95).setOrigin(0, 0.5);
  const rocket = k.scene.add.container(152, 66);
  rocket.add([
    k.scene.add.triangle(0, -28, 0, -44, 18, -16, -18, -16, YELLOW, 1).setStrokeStyle(1, INK),
    k.scene.add.rectangle(0, 4, 30, 48, 0xeaf2f8, 1).setStrokeStyle(1, INK),
    k.scene.add.triangle(0, 36, -15, 24, 15, 24, 0, 48, ORANGE, 0.95),
  ]);
  const actionText = k.localText(c, 0, -82, "GitHub Action waiting", 13, "#dbe6ef");
  const completeText = k.localText(c, 0, 116, "", 13, "#4ce0a0");
  const logos = ["Docker", "Redis", "Node.js", "Postgres", "RabbitMQ", "GitHub", "K8s"].map((label, i) => {
    const box = k.chip(c, 0, 10, label, GREEN, label.length > 7 ? 82 : 68);
    return { label, box, offset: i * 88 };
  });
  const armG = k.scene.add.graphics();
  c.add([...beltLines, progressBg, progressFill, rocket, armG]);

  let lastConfettiCycle = -1;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 180);
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
        k.confetti.emitParticleAt(v.x, v.y - 105, 32);
        k.notice(v.x, v.y - 210, "CI/CD rocket launched.", "#1f7f5b");
      }
    },
  };
}

export function createApiHighway(k: VignetteKit): Vignette {
  const v = { id: "api-highway", x: 4800, y: 3700, radius: 690 };
  const c = k.container(v.x, v.y, 52);
  k.floorDecal(c, 520, 260, BLUE, 0.2, 2);
  k.worldLabel(v.x, v.y - 170, "API Highway");
  const road = k.scene.add.rectangle(0, 0, 430, 170, 0x31363f, 0.92).setStrokeStyle(2, BLUE, 0.36);
  const lane1 = k.scene.add.rectangle(0, -42, 400, 4, PAPER, 0.7);
  const lane2 = k.scene.add.rectangle(0, 42, 400, 4, PAPER, 0.7);
  const limiter = k.localText(c, 0, 94, "", 13, "#f2b843");
  c.add([road, lane1, lane2]);
  const calls = ["GET", "POST", "PUT", "PATCH", "SLOW", "429"].map((label, i) => {
    const car = k.scene.add.container(0, 0);
    car.add(k.scene.add.rectangle(0, 0, label === "SLOW" ? 62 : 48, 26, label === "429" ? RED : BLUE, 0.95).setStrokeStyle(1, INK));
    car.add(k.scene.add.text(0, 0, label, { fontFamily: FONT, fontSize: "10px", color: "#ffffff" }).setOrigin(0.5));
    c.add(car);
    return { label, car, offset: i * 94, lane: i % 3 };
  });
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
      const phase = (ctx.time % 9000) / 9000;
      const crash = phase > 0.46 && phase < 0.62;
      calls.forEach((call) => {
        let x = -215 + ((ctx.time * (call.label === "SLOW" ? 0.035 : 0.075) + call.offset) % 430);
        let y = [-60, 0, 60][call.lane];
        if (crash && call.label === "429") {
          x = 28 + Math.sin(ctx.time * 0.03) * 3;
          y = 0;
          call.car.setRotation(0.55);
          k.smoke.emitParticleAt(v.x + x, v.y + y, 1);
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

export function createBroadcastQueue(k: VignetteKit): Vignette {
  const v = { id: "broadcast-queue", x: 3900, y: 6500, radius: 620 };
  const c = k.container(v.x, v.y, 60);
  k.floorDecal(c, 430, 260, BLUE, 0.24, 10);
  k.worldLabel(v.x, v.y - 152, "Broadcast Pipeline");
  k.screenPanel(c, -140, 0, 84, 60, BLUE, 0.94);
  k.localText(c, -140, 46, "campaign", 10, "#20242c");
  const queue = k.screenPanel(c, 0, 0, 66, 96, YELLOW, 0.94);
  k.localText(c, 0, 66, "queue", 10, "#20242c");
  const workers = [-58, 0, 58].map((y) => {
    k.screenPanel(c, 150, y, 70, 44, GREEN, 0.94);
    return { y, busy: 0 };
  });
  k.localText(c, 150, 92, "workers", 10, "#20242c");
  const depth = k.localText(c, 0, -66, "depth 0", 10, "#f2b843");
  const sent = k.localText(c, 0, 112, "", 12, "#20242c");
  const dots = Array.from({ length: 6 }, (_, i) => {
    const d = k.scene.add.circle(0, 0, 5, 0x9fc4e2, 0.95).setStrokeStyle(1, INK);
    c.add(d);
    return { d, offset: i / 6 };
  });
  let delivered = 0;
  return {
    ...v,
    update: (ctx) => {
      const p = k.proximity(ctx, v, 160);
      queue.setFillStyle(PANEL, 0.96);
      dots.forEach((dot, i) => {
        const t = ((ctx.time * 0.00022 + dot.offset) % 1) * (p > 0.06 ? 1 : 0);
        if (t < 0.45) {
          // campaign -> queue
          dot.d.setPosition(-140 + (t / 0.45) * 140, Math.sin(t * 9) * 8);
        } else {
          // queue -> a worker lane
          const kk = (t - 0.45) / 0.55;
          const lane = workers[i % 3].y;
          dot.d.setPosition(kk * 150, lane * kk);
        }
        dot.d.setAlpha(p > 0.06 ? 0.95 : 0);
        if (t > 0.97) delivered++;
      });
      depth.setText(`depth ${Math.round(2 + Math.sin(ctx.time * 0.001) * 2 + p * 4)}`);
      sent.setText(p > 0.1 ? `${(24000 + (delivered % 9000)).toLocaleString()} messages delivered` : "");
    },
  };
}
