import Groq from "groq-sdk";

const DEFAULT_GROQ_MODEL = "llama3-70b-8192";

let groqClient;

/**
 * Returns an instance of the Groq client, creating a new instance if necessary.
 * This function requires the environment variable GROQ_API_KEY to be set.
 */
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing required environment variable: GROQ_API_KEY");
  }

  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
};

// SAME system prompt (unchanged)
const systemPrompt = `You are an Islamic guidance assistant.

Your task is to understand the user's emotional or personal situation and provide:
- Qur'an references (Surah:Ayah format ONLY)
- Authentic Hadith references (Book name + Hadith number ONLY)
- FULL authentic Duas (Arabic + English translation + Urdu translation + title)

IMPORTANT RULES:
1. Return ONLY in STRICT JSON format.
2. Do NOT include any explanation outside JSON.
3. Do NOT include full Qur'an ayah text or Hadith text — only references.
4. Duas MUST be complete, authentic, and commonly known from Qur'an or Sunnah.
5. Ensure Arabic and Urdu text are accurate and properly written.
6. Use clear, simple English and Urdu translations.
7. Avoid weak (da'if) narrations.
8. If unsure about authenticity, DO NOT include it.

OUTPUT FORMAT:

{
  "user_intent": "<short summary>",
  "quran": ["2:286"],
  "hadiths": ["Sahih Muslim 2999"],
  "duas": [
    {
      "title": "...",
      "arabic": "...",
      "translation_en": "...",
      "translation_ur": "...",
      "reference": "..."
    }
  ]
}
`;

/**
 * Safe JSON parser (handles non-perfect responses from Groq)
 */
const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

/**
 * Generates Islamic guidance using Groq API
 * @param {string} prompt
 * @returns {Promise<object>}
 */
export const getIslamicGuidance = async (prompt) => {
  try {
    const client = getGroqClient();

    const completion = await client.chat.completions.create({
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "";

    const parsedResponse = safeParseJSON(content);

    if (!parsedResponse) {
      console.error("Invalid JSON response:", content);
      throw new Error("Failed to parse JSON");
    }

    return parsedResponse;

  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to generate AI response");
  }
};