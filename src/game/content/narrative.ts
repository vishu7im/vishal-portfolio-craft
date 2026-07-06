// Authored copy that isn't (or can't be) derived from db.json:
//   * achievements (no db field)
//   * future goals (no db field)
//   * developer jokes hidden on signs across the world
// Chapter title-card copy lives with the chapters themselves (world/index.ts).
// Edit freely — this is the human voice of the world.

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
  {
    id: "goal-future",
    title: "Future City — Coming Soon",
    detail:
      "The road doesn't end here. AI products, a startup, open source at global scale — the next district is under construction.",
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
