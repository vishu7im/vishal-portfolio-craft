import type { AreaId } from "../types";

// Authored copy that isn't (or can't be) derived from db.json:
//   * area intro lines (title cards / minimap labels)
//   * achievements (no db field)
//   * future goals (no db field)
//   * developer jokes hidden on signs across the world
// Edit freely — this is the human voice of the world.

export const AREA_INTRO: Partial<Record<AreaId, { title: string; line: string }>> = {
  forest: {
    title: "The Whispering Woods",
    line: "Where it all began — quiet roots beneath an old canopy.",
  },
  city: {
    title: "Shipping District",
    line: "Skylines raised from real, shipped work.",
  },
  garage: {
    title: "The Garage",
    line: "Tools, tuning, and every ride in the collection.",
  },
  "research-lab": {
    title: "The AI Lab",
    line: "Where language learns to think — and speak — aloud.",
  },
  "tech-campus": {
    title: "Tech Campus",
    line: "Lecture halls, first commits, and long apprenticeships.",
  },
  mountain: {
    title: "Summit Trail",
    line: "Cold air, high systems, and what's still to come.",
  },
  beach: {
    title: "The Boardwalk",
    line: "Side quests, clones, and code written just for fun.",
  },
  industrial: {
    title: "The Works",
    line: "Pipes, ledgers, and backends that carry real weight.",
  },
  "cloud-datacenter": {
    title: "Cloud Datacenter",
    line: "Racks humming in the dark, holding everything up.",
  },
};

export interface Achievement {
  id: string;
  title: string;
  detail: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-rag",
    title: "Production RAG Systems",
    detail:
      "Designed and shipped Retrieval-Augmented Generation pipelines with LangChain & LangGraph, vector embeddings, query translation and routing.",
  },
  {
    id: "ach-voice",
    title: "Real-Time Voice AI",
    detail:
      "Built low-latency voice-to-voice agents on LiveKit/WebRTC with full STT → LLM → TTS orchestration.",
  },
  {
    id: "ach-saas",
    title: "Multi-Tenant SaaS at Scale",
    detail:
      "Architected multi-tenant platforms (FabricatorOS, MetaOS) with microservices, Redis, and Gen-AI workflows.",
  },
];

export interface Goal {
  id: string;
  title: string;
  detail: string;
}

export const GOALS: Goal[] = [
  {
    id: "goal-btech",
    title: "B.Tech in AI & ML",
    detail:
      "Completing a B.Tech in Artificial Intelligence & Machine Learning at BITS Pilani (WILP).",
  },
  {
    id: "goal-agents",
    title: "Autonomous Agent Systems",
    detail: "Deepen work on multi-agent orchestration, tool-use, and the Model Context Protocol.",
  },
  {
    id: "goal-oss",
    title: "Open-Source & Scale",
    detail:
      "Contribute back, and build systems that serve at ever-larger scale with calm reliability.",
  },
];

/** Developer jokes painted on roadside signs. Pure flavour. */
export const DEV_JOKES: string[] = [
  "// TODO: fix this later (2019)",
  "It works on my machine ¯\\_(ツ)_/¯",
  "There are 10 kinds of people…",
  "git commit -m 'final FINAL v3'",
  "99 little bugs in the code…",
  "Have you tried turning it off and on?",
  "Caution: recursion ahead ahead ahead",
  "sudo make me a sandwich",
  "Prod is just staging with confidence",
  "The cake is a lie, the cache is not",
];
