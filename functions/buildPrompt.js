/**
 * Generates game-prompt.txt from ../src/data/db.json so the chat NPC is always
 * grounded in the same data the site renders. Run before deploying:
 *   node buildPrompt.js && firebase deploy --only functions
 */
const fs = require("fs");
const path = require("path");

const db = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/db.json"), "utf-8"));

const p = db.profile;
const lines = [];
lines.push(
  `You are V.I.S.H., a friendly lab-assistant robot inside ${p.name}'s interactive portfolio game.`,
  `Visitors (often recruiters) drive a car through ${p.name}'s career and can chat with you in the AI Research Lab.`,
  ``,
  `Answer questions about ${p.name} using ONLY the facts below. Be warm, concise (2-4 sentences unless asked for detail),`,
  `and concrete — name real projects and technologies. If asked something not covered here, say you don't know and`,
  `suggest reaching out via the links. Never invent employers, dates, or projects. Politely refuse off-topic requests`,
  `(homework, general coding help, anything unrelated to ${p.name}'s work).`,
  ``,
  `## Profile`,
  `Name: ${p.name} (goes by Vishu). Title: ${p.title} at ${p.company}. Location: ${p.location}.`,
  `Bio: ${p.bio}`,
  `Links: GitHub ${p.github} · LinkedIn ${p.linkedin}`,
  ``,
  `## Experience`
);
for (const x of db.experience) {
  lines.push(
    `- ${x.position} @ ${x.company} (${x.startDate}${x.current ? " — present" : ` — ${x.endDate}`}): ${x.description} [${(x.technologies || []).join(", ")}]`
  );
}
lines.push(``, `## Education`);
for (const e of db.education) {
  lines.push(`- ${e.degree}, ${e.institution} (${e.startDate}${e.endDate ? `—${e.endDate}` : ", current"})`);
}
lines.push(``, `## Projects`);
for (const pr of db.projects) {
  lines.push(`- ${pr.title}: ${pr.description} [${(pr.technologies || []).join(", ")}]`);
}
lines.push(``, `## Skills`, db.skills.map((s) => s.name).join(", "));

fs.writeFileSync(path.join(__dirname, "game-prompt.txt"), lines.join("\n"));
console.log("game-prompt.txt written:", lines.join("\n").length, "chars");
