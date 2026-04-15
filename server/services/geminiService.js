import { GoogleGenAI } from '@google/genai';

// Note: Ensure Gemini_MUQALMAH_API_KEY is available in process.env
const initializeGemini = () => {
  return new GoogleGenAI({ apiKey: process.env.Gemini_MUQALMAH_API_KEY });
};

export const getIslamicGuidance = async (prompt) => {
  try {
    const ai = initializeGemini();
    const systemPrompt = `You are a knowledgeable and empathetic Islamic assistant. 
Given ANY user problem, question, emotional query, or daily life situation, provide Islamic guidance by identifying relevant themes and returning:
1. themes: An array of strings representing the identified concepts or themes.
2. ayahs: An array of strictly 1 or 2 relevant ayah references in the exact format "surah:ayah" (e.g., "2:286", "94:5").
3. explanation: A short, comforting, or informative explanation connecting the Quranic themes, the ayahs, hadiths, and the user's query.
4. hadiths: An array of authentic hadiths containing { arabic, translation, reference } for each hadith.
5. duas: An array of authentic duas containing { arabic, translation, reference } for each dua.
    
Ensure absolute authenticity for the ayahs, hadiths, and duas. Be highly sensitive, respectful, and empathetic. Provide guidance based carefully on the Quran and Sunnah.
The "ayahs" array is mandatory whenever you mention or rely on Quran verses in the explanation.
If you cite a verse in the explanation, the same verse key must also appear in the "ayahs" array.

Respond with ONLY valid JSON strictly matching this structure:
{
  "themes": ["theme1", "theme2"],
  "ayahs": ["2:286"],
  "explanation": "...",
  "hadiths": [{"arabic": "...", "translation": "...", "reference": "Sahih al-Bukhari 123"}],
  "duas": [{"arabic": "...", "translation": "...", "reference": "..."}]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI response');
  }
};
