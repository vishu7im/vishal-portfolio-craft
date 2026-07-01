import type { RoadSegment } from "../types";

// A 3x3 grid of areas stitched by row + column roads, two dirt shortcuts, and a
// beach boardwalk spur over the lagoon.
//   cols x: 1500 / 4800 / 8100      rows y: 1400 / 3700 / 6000

export const roads: RoadSegment[] = [
  // --- rows (horizontal) ---
  {
    id: "row-top",
    kind: "asphalt",
    width: 170,
    points: [
      { x: 1500, y: 1400 },
      { x: 4800, y: 1400 },
      { x: 8100, y: 1500 },
    ],
  },
  {
    id: "row-mid",
    kind: "asphalt",
    width: 176,
    points: [
      { x: 1500, y: 3700 },
      { x: 4800, y: 3700 },
      { x: 8100, y: 3700 },
    ],
  },
  {
    id: "row-bot",
    kind: "asphalt",
    width: 170,
    points: [
      { x: 1500, y: 6000 },
      { x: 4800, y: 6000 },
      { x: 8100, y: 6000 },
    ],
  },
  // --- columns (vertical) ---
  {
    id: "col-left",
    kind: "asphalt",
    width: 170,
    points: [
      { x: 1500, y: 1400 },
      { x: 1500, y: 3700 },
      { x: 1500, y: 6000 },
    ],
  },
  {
    id: "col-mid",
    kind: "asphalt",
    width: 176,
    points: [
      { x: 4800, y: 1400 },
      { x: 4800, y: 3700 },
      { x: 4800, y: 6000 },
    ],
  },
  {
    id: "col-right",
    kind: "asphalt",
    width: 170,
    points: [
      { x: 8100, y: 1500 },
      { x: 8100, y: 3700 },
      { x: 8100, y: 6000 },
    ],
  },
  // --- dirt shortcuts (diagonal) ---
  {
    id: "shortcut-forest-beach",
    kind: "dirt",
    width: 120,
    shortcut: true,
    points: [
      { x: 1650, y: 1600 },
      { x: 3100, y: 2550 },
      { x: 4650, y: 3550 },
    ],
  },
  {
    id: "shortcut-lab-industrial",
    kind: "dirt",
    width: 120,
    shortcut: true,
    points: [
      { x: 7950, y: 3850 },
      { x: 6500, y: 4900 },
      { x: 4950, y: 5850 },
    ],
  },
  // --- beach boardwalk over the lagoon (leads to a secret) ---
  {
    id: "beach-boardwalk",
    kind: "boardwalk",
    width: 108,
    points: [
      { x: 5300, y: 4250 },
      { x: 6500, y: 4250 },
    ],
  },
];
