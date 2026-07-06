import type { RandomEventDef } from "../types";

// "Client calling" events: while free-roaming, the phone rings with a small
// timed job pulled from real projects. Destinations reference the new
// chronological map (see world/index.ts CHAPTERS for slot centers).

export const RANDOM_EVENTS: RandomEventDef[] = [
  {
    id: "ev-ai-agent",
    caller: "Startup founder",
    pitch: "We need an AI agent demo in 24 hours. Can you get to the lab?",
    timeLimitMs: 60000,
    rewardXp: 60,
    destination: { x: 900, y: 5450, label: "Reach the AI Research Lab" },
  },
  {
    id: "ev-double-booking",
    caller: "bnbMEhome client",
    pitch: "Two guests, one room — a double booking! Get to Freelance Bay!",
    timeLimitMs: 55000,
    rewardXp: 50,
    destination: { x: 8100, y: 2900, label: "Fix the booking at bnbMEhome" },
  },
  {
    id: "ev-queue-backup",
    caller: "On-call pager",
    pitch: "The message queue is backing up. Workers need a kick.",
    timeLimitMs: 55000,
    rewardXp: 55,
    destination: { x: 5400, y: 5500, label: "Restart the workers in Startup District" },
  },
  {
    id: "ev-invoice-recon",
    caller: "Finance team",
    pitch: "Month-end close: 40 unmatched invoices at the plant.",
    timeLimitMs: 60000,
    rewardXp: 50,
    destination: { x: 2150, y: 3200, label: "Run reconciliation at EasySupply" },
  },
  {
    id: "ev-demo-day",
    caller: "Old professor",
    pitch: "Demo day at the polytechnic — students want to see real code.",
    timeLimitMs: 65000,
    rewardXp: 45,
    destination: { x: 8100, y: 1500, label: "Swing by the First Workshop" },
  },
  {
    id: "ev-hotfix",
    caller: "Edgenroots teammate",
    pitch: "Prod hotfix needs a review before the deploy window closes.",
    timeLimitMs: 50000,
    rewardXp: 55,
    destination: { x: 850, y: 3200, label: "Review at Edgenroots HQ" },
  },
];
