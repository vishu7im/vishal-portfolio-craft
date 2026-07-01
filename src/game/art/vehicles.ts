import Phaser from "phaser";
import { bakeSvg } from "./textureFactory";

// Top-down car art, authored as SVG. Cars point RIGHT (+x = forward) to match
// the physics forward vector. One flexible generator, six silhouettes/palettes.

export interface VehicleArt {
  key: string;
  bodyLight: string;
  bodyDark: string;
  cabin: string;
  accent: string;
  w: number;
  h: number;
  wing?: boolean; // F1 rear wing + exposed wheels
  fenders?: boolean; // vintage rounded fenders
  hover?: boolean; // no wheels + underglow
  glow?: string; // neon underglow color (cyber/hover)
}

export const VEHICLE_ART: Record<string, VehicleArt> = {
  sports: { key: "sports", bodyLight: "#f26d5b", bodyDark: "#d1483a", cabin: "#2a2f3a", accent: "#ffd36b", w: 92, h: 44 },
  cyber: { key: "cyber", bodyLight: "#2b3550", bodyDark: "#1a2036", cabin: "#0e1626", accent: "#31e0d0", glow: "#31e0d0", w: 92, h: 44 },
  electric: { key: "electric", bodyLight: "#8ee6c8", bodyDark: "#4fbf9a", cabin: "#20353a", accent: "#eafff6", w: 88, h: 44 },
  f1: { key: "f1", bodyLight: "#3a63d8", bodyDark: "#254aa8", cabin: "#12203f", accent: "#ffd36b", wing: true, w: 100, h: 42 },
  vintage: { key: "vintage", bodyLight: "#e8d3a0", bodyDark: "#c2a86f", cabin: "#4a3826", accent: "#8f5a3a", fenders: true, w: 92, h: 46 },
  hover: { key: "hover", bodyLight: "#a88cff", bodyDark: "#7b5cff", cabin: "#241a4a", accent: "#e6ddff", hover: true, glow: "#a88cff", w: 92, h: 46 },
};

function carSvg(a: VehicleArt): string {
  const w = a.w;
  const h = a.h;
  const wheels = a.hover
    ? ""
    : a.wing
    ? `<rect x="16" y="-1" width="18" height="8" rx="4" fill="#22262e"/>
       <rect x="16" y="${h - 7}" width="18" height="8" rx="4" fill="#22262e"/>
       <rect x="62" y="-1" width="18" height="8" rx="4" fill="#22262e"/>
       <rect x="62" y="${h - 7}" width="18" height="8" rx="4" fill="#22262e"/>`
    : `<rect x="20" y="1" width="16" height="6" rx="3" fill="#22262e"/>
       <rect x="20" y="${h - 7}" width="16" height="6" rx="3" fill="#22262e"/>
       <rect x="58" y="1" width="16" height="6" rx="3" fill="#22262e"/>
       <rect x="58" y="${h - 7}" width="16" height="6" rx="3" fill="#22262e"/>`;

  const underglow = a.glow
    ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 + 3}" fill="${a.glow}" opacity="0.28" filter="url(#blur)"/>`
    : "";

  const fenders = a.fenders
    ? `<circle cx="27" cy="7" r="9" fill="${a.bodyDark}"/><circle cx="27" cy="${h - 7}" r="9" fill="${a.bodyDark}"/>
       <circle cx="65" cy="7" r="9" fill="${a.bodyDark}"/><circle cx="65" cy="${h - 7}" r="9" fill="${a.bodyDark}"/>`
    : "";

  const wing = a.wing
    ? `<rect x="2" y="4" width="7" height="${h - 8}" rx="2" fill="#22262e"/><rect x="6" y="8" width="4" height="${h - 16}" rx="2" fill="${a.accent}"/>`
    : "";

  const cabinR = a.hover || a.fenders ? 13 : 11;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a.bodyLight}"/>
      <stop offset="0.55" stop-color="${a.bodyLight}"/>
      <stop offset="1" stop-color="${a.bodyDark}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#cfeaf5"/>
      <stop offset="1" stop-color="#7fb9d6"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  ${underglow}
  ${wheels}
  ${fenders}
  ${wing}
  <rect x="3" y="5" width="${w - 6}" height="${h - 10}" rx="15" fill="url(#body)" stroke="#20242c" stroke-width="1.5"/>
  <path d="M ${w - 20} 8 Q ${w - 4} ${h / 2} ${w - 20} ${h - 8}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-linecap="round"/>
  <rect x="24" y="9" width="46" height="${h - 18}" rx="${cabinR}" fill="${a.cabin}"/>
  <path d="M 58 12 L 68 ${h / 2} L 58 ${h - 12} Z" fill="url(#glass)"/>
  <path d="M 34 13 L 27 ${h / 2} L 34 ${h - 13} Z" fill="url(#glass)" opacity="0.85"/>
  <rect x="6" y="${h / 2 - 1.5}" width="${w - 12}" height="3" rx="1.5" fill="${a.accent}" opacity="0.9"/>
  <circle cx="${w - 7}" cy="12" r="2.6" fill="#fff6d8"/>
  <circle cx="${w - 7}" cy="${h - 12}" r="2.6" fill="#fff6d8"/>
  <rect x="4" y="10" width="3" height="5" rx="1.5" fill="#ff5a4d"/>
  <rect x="4" y="${h - 15}" width="3" height="5" rx="1.5" fill="#ff5a4d"/>
</svg>`;
}

export async function buildVehicleTextures(scene: Phaser.Scene): Promise<void> {
  await Promise.all(
    Object.values(VEHICLE_ART).map((a) => bakeSvg(scene, `car-${a.key}`, carSvg(a), a.w, a.h))
  );
}
