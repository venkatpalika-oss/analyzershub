/**
 * InstMates AI – askAI Cloud Function (FINAL – STABLE)
 */

const { onRequest } = require("firebase-functions/v2/https");
const fetch = require("node-fetch");

exports.askAI = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "512MiB",
    secrets: ["OPENAI_API_KEY"]
  },
  async (req, res) => {
    try {
      /* ================= CORS ================= */
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

      if (req.method === "OPTIONS") {
        return res.status(204).send("");
      }

      /* ================= INPUT ================= */
      const { analyzer, detector, question, knowledge } = req.body;

      if (!question || !knowledge) {
        return res.status(400).json({
          error: "Missing question or knowledge base"
        });
      }

      /* ================= PROMPTS ================= */
      const systemPrompt = `
You are a senior field instrumentation and analyzer engineer.

Rules:
- Use ONLY the provided knowledge base
- Do NOT guess
- Be practical and field-oriented
- Follow this structure strictly:

1. Interpretation
2. Most Probable Cause
3. Field Check Sequence
4. What This Is NOT
5. Field Rule
`;

      const userPrompt = `
Analyzer: ${analyzer}
Detector: ${detector || "N/A"}

Knowledge Base:
${knowledge}

Problem:
${question}
`;

      /* ================= OPENAI CALL ================= */
      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            input: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.2
          })
        }
      );

      const data = await response.json();

      const text =
        data.output_text ||
        data.output?.[0]?.content?.[0]?.text ||
        "";

      if (!text) {
        console.error("OpenAI raw response:", data);
        return res.status(500).json({
          error: "Invalid response from OpenAI"
        });
      }

      return res.status(200).json({ answer: text });

    } catch (err) {
      console.error("askAI fatal error:", err);
      return res.status(500).json({
        error: "AI processing failed"
      });
    }
  }
);
