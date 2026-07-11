import { getPortfolioData } from "@/services/dataService";

// Offline brain for the V.I.S.H. lab assistant: a keyword matcher over db.json.
// Used whenever VITE_CHAT_ENDPOINT is unset or the live endpoint fails, so the
// game feels complete on GitHub Pages with no backend deployed.

export const SUGGESTED_QUESTIONS = [
  "What AI products has Vishal built?",
  "Tell me about his backend work",
  "What's his current role?",
  "How can I contact him?",
];

interface Rule {
  match: RegExp;
  answer: () => string;
}

function projectNames(filter: (t: string[]) => boolean): string {
  const db = getPortfolioData();
  return db.projects
    .filter((p) => filter(p.technologies?.map((t) => t.toLowerCase()) ?? []))
    .map((p) => p.title)
    .join(", ");
}

const RULES: Rule[] = [
  {
    match: /\b(ai|ml|llm|rag|voice|agent|langchain|openai|gpt|model)\b/i,
    answer: () => {
      const db = getPortfolioData();
      const vox = db.projects.find((p) => p.id === "12");
      const kiki = db.projects.find((p) => p.id === "3");
      return `Vishal builds production AI systems — RAG pipelines with LangChain/LangGraph, and real-time voice agents. Flagships: ${vox?.title ?? "VoxAI"} (low-latency voice-to-voice on WebRTC with full STT → LLM → TTS orchestration) and ${kiki?.title ?? "Kiki"}. Drive around this lab to see them boot up!`;
    },
  },
  {
    match: /\b(backend|api|server|node|express|micro|redis|docker|queue|scale)\b/i,
    answer: () =>
      `Backend is home turf: Node.js, TypeScript, Express, Redis, Docker, and microservices. Production platforms include ${projectNames((t) => t.includes("node.js") || t.includes("express")) || "FabricatorOS, MetaOS, EasySupply"}. Backend City (chapter 7 on your map) is built from that work.`,
  },
  {
    match: /\b(job|role|work|company|edgenroots|icomply|experience|career)\b/i,
    answer: () => {
      const db = getPortfolioData();
      const cur = db.experience.find((x) => x.current) ?? db.experience[0];
      return `Right now: ${cur.position} at ${cur.company}. Before that, ${db.experience
        .filter((x) => !x.current)
        .map((x) => `${x.position} at ${x.company}`)
        .join("; ")}. The whole map is his career in chronological order — you're driving through it.`;
    },
  },
  {
    match: /\b(study|education|school|college|polytechnic|degree|b\.?tech|bits)\b/i,
    answer: () => {
      const db = getPortfolioData();
      return db.education
        .map((e) => `${e.degree} — ${e.institution}`)
        .join(" · ");
    },
  },
  {
    match: /\b(project|portfolio|built|made|show)\b/i,
    answer: () => {
      const db = getPortfolioData();
      const featured = db.projects.filter((p) => p.featured).map((p) => p.title);
      return `${db.projects.length} projects live in this world. Featured: ${featured.join(", ")}. Each one is a building — drive up and press E for the story, stack, and links.`;
    },
  },
  {
    match: /\b(contact|hire|email|reach|linkedin|github|resume|cv)\b/i,
    answer: () => {
      const db = getPortfolioData();
      return `Best routes: GitHub (${db.profile.github}) or LinkedIn (${db.profile.linkedin}). There's also a classic résumé view — top-center button.`;
    },
  },
  {
    match: /\b(hi|hello|hey|who are you|what are you)\b/i,
    answer: () =>
      `Hey! I'm V.I.S.H. — Vishal's lab assistant. Ask me about his AI work, backend systems, career, or how to reach him.`,
  },
];

export function scriptedReply(question: string): string {
  for (const rule of RULES) {
    if (rule.match.test(question)) return rule.answer();
  }
  const db = getPortfolioData();
  return `Hmm, that's outside my training data. I know about ${db.profile.name}'s projects, AI & backend work, career, and education — try one of those, or grab the résumé from the top center.`;
}
