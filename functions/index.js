/**
 * Firebase Cloud Functions entry point.
 *
 * The only live function is `portfolioChat` — a stateless, rate-limited in-game
 * chat NPC whose system prompt is generated from `src/data/db.json` by
 * `buildPrompt.js` (see `game-prompt.txt`). It keeps no per-user server state.
 *
 * The previous stateful `chatWithGemini` endpoint (backed by world-writable
 * `devices`/`sessions`/`messages` Firestore collections) has been removed; the
 * frontend has talked to `portfolioChat` exclusively since it landed.
 */
const { setGlobalOptions } = require("firebase-functions");
const admin = require("firebase-admin");

// Cost control: cap concurrent containers to blunt traffic-spike billing.
setGlobalOptions({ maxInstances: 5 });

admin.initializeApp();

// Stateless in-game chat NPC (rate-limited; prompt from game-prompt.txt).
exports.portfolioChat = require("./portfolioChat").portfolioChat;
