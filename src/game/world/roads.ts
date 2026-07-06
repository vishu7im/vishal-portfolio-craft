import type { RoadSegment } from "../types";

// The Career Road: one serpentine spine that visits every life chapter in
// order — top row L→R, down the right edge, mid row R→L, down the left edge,
// bottom row L→R. Connector roads keep free-roam shortcuts alive.
//   cols x: 1500 / 4800 / 8100      rows y: 1400 / 3700 / 6000

export const roads: RoadSegment[] = [
  // --- the chronological spine (Ch1 home → Ch13 future gate) ---
  {
    id: "career-road",
    kind: "asphalt",
    width: 190,
    spine: true,
    points: [
      { x: 1500, y: 1400 }, // Ch1 home
      { x: 4800, y: 1400 }, // Ch2 school
      { x: 8100, y: 1500 }, // Ch3-4 polytechnic / first code
      { x: 8100, y: 3700 }, // Ch5 freelance bay
      { x: 4800, y: 3700 }, // Ch6 first office
      { x: 1500, y: 3700 }, // Ch7 backend city
      { x: 1500, y: 6000 }, // Ch8 AI lab
      { x: 4800, y: 6000 }, // Ch9-10 startup district
      { x: 8100, y: 6000 }, // Ch11-13 summit & future
    ],
  },
  // --- connectors (free-roam shortcuts off the spine) ---
  {
    id: "conn-left-top",
    kind: "asphalt",
    width: 150,
    points: [
      { x: 1500, y: 1400 },
      { x: 1500, y: 3700 },
    ],
  },
  {
    id: "conn-mid",
    kind: "asphalt",
    width: 150,
    points: [
      { x: 4800, y: 1400 },
      { x: 4800, y: 3700 },
      { x: 4800, y: 6000 },
    ],
  },
  {
    id: "conn-right-bottom",
    kind: "asphalt",
    width: 150,
    points: [
      { x: 8100, y: 3700 },
      { x: 8100, y: 6000 },
    ],
  },
  // --- dirt shortcuts (diagonal) ---
  {
    id: "shortcut-home-office",
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
    id: "shortcut-bay-startup",
    kind: "dirt",
    width: 120,
    shortcut: true,
    points: [
      { x: 7950, y: 3850 },
      { x: 6500, y: 4900 },
      { x: 4950, y: 5850 },
    ],
  },
  // --- boardwalk over the Freelance Bay lagoon (leads to a secret) ---
  {
    id: "beach-boardwalk",
    kind: "boardwalk",
    width: 108,
    points: [
      { x: 8600, y: 4250 },
      { x: 9400, y: 4250 },
    ],
  },
];
