/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const fs = require("fs");
const path = require("path");
const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require('@google/generative-ai');

const cors = require("cors")({ origin: true });

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 5 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

const db = admin.firestore();

const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, "prompt.txt"), "utf-8");

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_B);
const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    responseMimeType: 'application/json'
});

exports.chatWithGemini = onRequest(async (req, res) => {

    cors(req, res, async () => {
        try {
            const { device_id, session_id, message } = req.body;

            if (!device_id || !session_id || !message) {
                return res.status(400).send({ error: "Missing parameters" });
            }


            // --- Check if device exists ---
            // const deviceDoc = await db.collection("devices").doc(device_id).get();
            // if (!deviceDoc.exists) {
            //   return res.status(400).send({ error: "Device not found" });
            // }

            // --- Use provided session_id or generate a new one ---
            const finalSessionId = session_id
            const sessionRef = db.collection("sessions").doc(finalSessionId);
            let sessionDoc = await sessionRef.get();

            let description = "";
            if (sessionDoc.data().description == "New Chat") {
                // Create new session with empty description (to be generated)
                const DESC_SYSTEM_PROMPT = "You are a summarizer. Create a concise 5-7 word summary for a conversation.";
                const descPrompt = `Generate a short description (5-7 words) summarizing this conversation: "${message}"`;

                const minimodel = genAI.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    responseMimeType: 'application/json'
                });

                const descResponse = await minimodel.startChat({
                    history: [
                        { role: "user", parts: [{ text: DESC_SYSTEM_PROMPT }] },

                    ],

                });
                const Dresult = await descResponse.sendMessage(descPrompt);
                description = Dresult.response.text();

                await sessionRef.update({
                    description: description
                });

            } else {
                description = sessionDoc.data().description;
            }

            // --- Fetch last 30 messages ---
            const messagesSnapshot = await db.collection("messages")
                .where("session_id", "==", finalSessionId)
                .orderBy("timestamp", "desc")
                .limit(30)
                .get();

            const geminiHistory = [];
            messagesSnapshot.forEach(doc => {
                const data = doc.data();
                geminiHistory.unshift({ role: data.role, parts: [{ text: data.message }] }); // oldest first
            });
            // Append new user message
            // geminiHistory.push({ role: "user", parts: [{ text: message }] });



            // --- Call Gemini SDK for AI reply ---
            const chatResponse = await model.startChat({
                history: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    ...geminiHistory
                ],
            });

            const chatReply = await chatResponse.sendMessage(message);

            const reply = chatReply.response.text();

            // --- Save user message ---
            const user_message = {
                message_id: db.collection("messages").doc().id,
                device_id,
                session_id: finalSessionId,
                role: "user",
                message,
                created_at: new Date()
            }
            await db.collection("messages").add(user_message);

            // --- Save AI reply ---

            const ai_message = {
                message_id: db.collection("messages").doc().id,
                device_id,
                session_id: finalSessionId,
                role: "model",
                message: reply,
                created_at: new Date()
            }

            await db.collection("messages").add(ai_message);



            // --- Return structured response ---
            res.send({
                session: finalSessionId,
                description,
                message: [user_message, ai_message]
            });

        } catch (err) {
            console.error("Error in chatWithGemini:", err);
            res.status(500).send({ error: "Internal Server Error" });
        }

    })
});