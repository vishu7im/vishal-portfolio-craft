import Phaser from "phaser";
import { PALETTE } from "../config/palette";
import { makeCanvasTexture } from "./textureFactory";

// Procedural utility textures (tileable ground, soft blobs, particles, marks).
// These are drawn directly to canvas — cheaper than SVG for simple radial/tiled
// art and used at explicit display sizes, so they sit outside the TEX_SS scheme.

export function buildGroundTextures(scene: Phaser.Scene): void {
  // Tileable warm-paper ground with a faint dot grid (mirrors .world-floor).
  makeCanvasTexture(scene, "ground", 128, 128, (ctx, w, h) => {
    ctx.fillStyle = PALETTE.paper;
    ctx.fillRect(0, 0, w, h);
    // subtle vertical warmth
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0.02)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PALETTE.dot;
    for (let y = 16; y < h; y += 32) {
      for (let x = 16; x < w; x += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // Soft radial blob — tinted per area to paint cozy region patches.
  makeCanvasTexture(scene, "area-blob", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,0.92)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Soft round particle for dust/smoke (tinted at emit time).
  makeCanvasTexture(scene, "soft", 32, 32, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Tire mark — a soft dark rounded streak.
  makeCanvasTexture(scene, "tiremark", 12, 18, (ctx, w, h) => {
    ctx.fillStyle = "rgba(30,32,38,0.55)";
    const r = 5;
    ctx.beginPath();
    ctx.moveTo(w / 2 - r, 1);
    ctx.arcTo(w, 1, w, h / 2, r);
    ctx.arcTo(w, h - 1, w / 2, h - 1, r);
    ctx.arcTo(0, h - 1, 0, h / 2, r);
    ctx.arcTo(0, 1, w / 2, 1, r);
    ctx.fill();
  });

  // 4-point sparkle for pickups.
  makeCanvasTexture(scene, "sparkle", 32, 32, (ctx, w, h) => {
    const cx = w / 2,
      cy = h / 2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 2; i++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, -cy);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, cy);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  });

  // Soft glow disc (reaction lights, window glow — tinted per area accent).
  makeCanvasTexture(scene, "glow", 128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.4, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Round soft car shadow (detaches on jumps).
  makeCanvasTexture(scene, "car-shadow", 96, 56, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(22,26,34,0.34)");
    g.addColorStop(0.7, "rgba(22,26,34,0.18)");
    g.addColorStop(1, "rgba(22,26,34,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Splash droplet for puddles.
  makeCanvasTexture(scene, "splash", 16, 16, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(180,230,240,0.95)");
    g.addColorStop(1, "rgba(120,200,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}
