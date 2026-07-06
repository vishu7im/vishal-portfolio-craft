import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { gameStore, useGameStore } from "@/game/state/gameStore";
import { WORLD } from "@/game/world";
import { sendChat, chatIsLive, type ChatMessage } from "@/services/chatService";
import { SUGGESTED_QUESTIONS } from "@/game/content/scriptedChat";

/**
 * Chat with V.I.S.H., the lab-assistant NPC. Opens when a "chat" anchor is
 * focused; mirrors PortfolioPanel styling. History lives client-side only.
 */
export function ChatPanel() {
  const focusedId = useGameStore((s) => s.focusedId);
  const anchor = focusedId ? WORLD.anchors.find((a) => a.id === focusedId) : null;
  const open = anchor?.content.contentKind === "chat";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(!chatIsLive);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const history: ChatMessage[] = [...messages, { role: "user", text: q }];
    setMessages(history);
    setBusy(true);
    const reply = await sendChat(history);
    setOffline(reply.offline);
    setMessages([...history, { role: "model", text: reply.text }]);
    setBusy(false);
  };

  return (
    <div
      className="panel-slide pointer-events-none fixed right-0 top-0 z-40 flex h-[100dvh] w-[min(440px,92vw)] items-center pr-4 sm:pr-6"
      data-open={open}
      aria-hidden={!open}
    >
      <div className="glass pointer-events-auto flex max-h-[82dvh] w-full flex-col rounded-[26px] p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
              Lab Assistant {offline && "· ⚡ offline mode"}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-tight">🤖 V.I.S.H.</h2>
          </div>
          <button
            onClick={() => gameStore.focus(null)}
            className="-mr-1 -mt-1 grid h-8 w-8 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="thin-scroll mt-4 min-h-[180px] flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div>
              <p className="text-sm text-white/70">
                Hi! I'm Vishal's lab assistant. Ask me anything about his work.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="glass-chip !text-[11px] transition hover:bg-white/20"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                m.role === "user"
                  ? "ml-auto bg-white/90 text-black"
                  : "bg-white/10 text-white/90"
              }`}
            >
              <div className="prose-sm prose-invert [&_a]:underline [&_p]:m-0">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {busy && (
            <div className="w-16 rounded-2xl bg-white/10 px-3.5 py-2.5">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70"
                    style={{ animationDelay: `${i * 140}ms` }}
                  />
                ))}
              </span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Ask about Vishal's work…"
            className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/15 focus:ring-white/40"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black transition enabled:hover:bg-white disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
