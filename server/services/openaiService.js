import OpenAI from "openai";

const DEFAULT_OPENAI_MODEL = "gpt-4o";

let openAiClient;

/**
 * Returns an instance of the OpenAI client, creating a new instance if necessary.
 * This function requires the environment variable MUKALMAH_API_KEY to be set.
 * @returns {OpenAI} an instance of the OpenAI client.
 */
const getOpenAIClient = () => {
  if (!process.env.MUKALMAH_API_KEY) {
    throw new Error("Missing required environment variable: OPENAI_API_KEY");
  }

  if (!openAiClient) {
    openAiClient = new OpenAI({ apiKey: process.env.MUKALMAH_API_KEY });
  }

  return openAiClient;
};

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
  "quran": [
    "2:286",
    "94:5"
  ],
  "hadiths": [
    "Sahih al-Bukhari 5641",
    "Sahih Muslim 2999"
  ],
  "duas": [
    {
      "title": "<Short descriptive title>",
      "arabic": "<Full authentic dua in Arabic>",
      "translation_en": "<Clear English translation>",
      "translation_ur": "<Clear Urdu translation>",
      "reference": "<Qur'an reference or Hadith source or 'General Sunnah'>"
    }
  ]
}

GUIDELINES:
- Provide 1-3 Qur'an references (SurahNumber:AyahNumber).
- Provide 1-3 authentic Hadith references (prefer Sahih al-Bukhari, Sahih Muslim).
- Provide 1-2 FULL duas.
- Ensure duas are highly relevant to the user’s situation.
- Dua must be in context of user's prompt not just a random dua
- Prefer well-known authentic duas, such as:
  - “Allahumma inni a'udhu bika minal-hammi wal-hazan…”
  - “La ilaha illa anta, subhanaka inni kuntu minaz-zalimin”
  - “Allahumma la sahla illa ma ja'altahu sahla…”

SPECIAL CASES:
- Anxiety / depression → include duas for relief, ease, and reliance on Allah.
- Sin / guilt → include duas for forgiveness (istighfar).
- Confusion → include duas for guidance.
- Hardship → include duas for patience and ease.

EXAMPLE INPUT:
"I feel very anxious and stressed"

EXAMPLE OUTPUT:
{
  "user_intent": "feeling anxious and stressed",
  "quran": ["94:5", "2:286"],
  "hadiths": ["Sahih Muslim 2999"],
  "duas": [
    {
      "title": "Dua for Anxiety and Grief",
      "arabic": "اللّهُـمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ...",
      "translation_en": "O Allah, I seek refuge in You from anxiety and sorrow...",
      "translation_ur": "اے اللہ! میں تجھ سے غم اور پریشانی سے پناہ مانگتا ہوں...",
      "reference": "Sahih al-Bukhari"
    },
    {
      "title": "Dua of Prophet Yunus (AS)",
      "arabic": "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      "translation_en": "There is no deity except You; exalted are You. Indeed, I have been among the wrongdoers.",
      "translation_ur": "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ہی ظالموں میں سے تھا۔",
      "reference": "Qur'an 21:87"
    }
  ]
}`;

/**
 * Generates Islamic guidance based on the user's prompt.
 * The guidance is generated using the OpenAI API and is returned as a JSON object.
 * The JSON object contains the following keys:
 * - user_intent: a short summary of the user's intent.
 * - quran: an array of Qur'an references (Surah:Ayah format).
 * - hadiths: an array of Hadith references (Book name + Hadith number format).
 * - duas: an array of duas, each containing the following keys:
 *   - title: a short descriptive title for the dua.
 *   - arabic: the full authentic dua in Arabic.
 *   - translation_en: the clear English translation of the dua.
 *   - translation_ur: the clear Urdu translation of the dua.
 *   - reference: the Qur'an reference or Hadith source or 'General Sunnah'.
 * @param {string} prompt the user's prompt.
 * @returns {Promise<object>} a promise that resolves to a JSON object containing the generated Islamic guidance.
 * @throws {Error} if the OpenAI API request fails or if the JSON response is invalid.
 */
export const getIslamicGuidance = async (prompt) => {
  try {
    const client = getOpenAIClient();

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    // Parse JSON safely
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (err) {
      console.error("Invalid JSON response:", content);
      throw new Error("Failed to parse JSON");
    }
    return parsedResponse;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
};
