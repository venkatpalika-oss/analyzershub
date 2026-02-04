/**
 * InstMates AI – askAI Cloud Function (FINAL, v2 SAFE)
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const fetch = require("node-fetch");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

exports.askAI = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "512MiB",
    secrets: [OPENAI_API_KEY],
    cors: true
  },
  async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      const { analyzer, detector, question, knowledge } = req.body || {};

      if (!question || !knowledge) {
        return res.status(400).json({
          error: "Missing question or knowledge base"
        });
      }

      const systemPrompt = `
You are a senior field instrumentation and analyzer engineer.

Rules:
- Use ONLY the provided knowledge base
- Do NOT guess
- Do NOT add theory
- Be practical and field-oriented
- Follow this structure strictly:

1. Interpretation
2. Most probable cause
3. Field check sequence
4. What this is NOT
5. Field rule

Knowledge base:
${knowledge}
`;

      const userPrompt = `
Analyzer: ${analyzer}
Detector: ${detector || "Not specified"}

Problem:
${question}
`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY.value()}`
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2
          })
        }
      );

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        console.error("OpenAI response:", data);
        return res.status(500).json({
          error: "Invalid response from OpenAI"
        });
      }

      return res.status(200).json({
        answer: data.choices[0].message.content
      });

    } catch (err) {
      console.error("askAI error:", err);
      return res.status(500).json({
        error: "AI processing failed"
      });
    }
  }
);
