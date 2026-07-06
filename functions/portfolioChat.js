/**
 * Stateless chat endpoint for the in-game V.I.S.H. lab assistant.
 * The client sends the whole (clamped) history; nothing is persisted except a
 * per-IP rate-limit counter in Firestore. System prompt is generated from
 * db.json by buildPrompt.js at deploy time.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { onRequest } = require("firebase-functions/https");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ALLOWED_ORIGINS = [
  "https://vishu7im.github.io",
  "http://localhost:8080",
  "http://localhost:5173",
];

const MAX_MESSAGES = 10;
const MAX_CHARS = 500;
const RATE_LIMIT = 10; // messages
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes

const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, "game-prompt.txt"), "utf-8");

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_B);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
});

async function checkRateLimit(ip) {
  const key = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 24);
  const ref = admin.firestore().collection("chat_rate").doc(key);
  const now = Date.now();
  return admin.firestore().runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.exists ? doc.data() : { count: 0, windowStart: now };
    if (now - data.windowStart > RATE_WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now });
      return true;
    }
    if (data.count >= RATE_LIMIT) return false;
    tx.set(ref, { count: data.count + 1, windowStart: data.windowStart });
    return true;
  });
}

exports.portfolioChat = onRequest({ maxInstances: 2 }, async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).send({ error: "POST only" });

  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
    if (!messages || messages.length === 0) {
      return res.status(400).send({ error: "messages[] required" });
    }
    const clamped = messages.slice(-MAX_MESSAGES).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      text: String(m.text || "").slice(0, MAX_CHARS),
    }));
    const last = clamped[clamped.length - 1];
    if (last.role !== "user" || !last.text.trim()) {
      return res.status(400).send({ error: "last message must be from user" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    if (!(await checkRateLimit(ip))) {
      return res.status(429).send({ error: "rate_limited" });
    }

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood — I'm V.I.S.H., ready to talk about Vishal's work." }] },
        ...clamped.slice(0, -1).map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      ],
    });
    const result = await chat.sendMessage(last.text);
    return res.send({ reply: result.response.text() });
  } catch (err) {
    console.error("portfolioChat error:", err);
    return res.status(500).send({ error: "internal" });
  }
});
