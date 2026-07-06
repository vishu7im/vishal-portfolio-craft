import { scriptedReply } from "@/game/content/scriptedChat";

// Talks to the portfolioChat Firebase function when VITE_CHAT_ENDPOINT is set;
// otherwise (or on any failure/timeout) falls back to the scripted brain so
// the NPC always answers, even on a static GitHub Pages deploy.

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface ChatReply {
  text: string;
  offline: boolean;
  rateLimited?: boolean;
}

const ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT as string | undefined;
const TIMEOUT_MS = 6000;

export async function sendChat(history: ChatMessage[]): Promise<ChatReply> {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!ENDPOINT) {
    return { text: scriptedReply(lastUser?.text ?? ""), offline: true };
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-10) }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (res.status === 429) {
      return {
        text: "Whoa, that's a lot of questions! My rate limiter kicked in — give me a few minutes, or check the résumé view meanwhile.",
        offline: false,
        rateLimited: true,
      };
    }
    if (!res.ok) throw new Error(`chat endpoint ${res.status}`);
    const data = (await res.json()) as { reply?: string };
    if (!data.reply) throw new Error("empty reply");
    return { text: data.reply, offline: false };
  } catch {
    return { text: scriptedReply(lastUser?.text ?? ""), offline: true };
  }
}

export const chatIsLive = !!ENDPOINT;
