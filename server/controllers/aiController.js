import Chat from '../models/Chat.js';
import { getIslamicGuidance } from '../services/openaiService.js';
import { fetchAyahsData } from '../services/quranApiService.js';

const extractAyahKeys = (guidanceData) => {
  if (!Array.isArray(guidanceData?.quran)) {
    return [];
  }

  return [...new Set(guidanceData.quran.filter((reference) => typeof reference === 'string' && reference.trim()))];
};

const buildExplanation = (guidanceData) => {
  const userIntent =
    typeof guidanceData?.user_intent === 'string' ? guidanceData.user_intent.trim() : '';

  if (!userIntent) {
    return 'I found some relevant Quranic guidance, hadith references, and duas for your situation.';
  }

  return `I understand your situation as: ${userIntent}. Here are Quran verses, hadith references, and duas that may help.`;
};

const normalizeHadiths = (hadiths) => {
  if (!Array.isArray(hadiths)) {
    return [];
  }

  return hadiths
    .filter((hadith) => typeof hadith === 'string' && hadith.trim())
    .map((hadith) => {
      const reference = hadith.trim();

      return {
        arabic: '',
        translation: reference,
        reference,
      };
    });
};

const normalizeDuas = (duas) => {
  if (!Array.isArray(duas)) return [];

  return duas
    .filter((dua) => dua && typeof dua === "object")
    .map((dua) => ({
      title: typeof dua.title === "string" ? dua.title.trim() : "",
      arabic: typeof dua.arabic === "string" ? dua.arabic.trim() : "",
      translation_en:
        typeof dua.translation_en === "string"
          ? dua.translation_en.trim()
          : "",
      translation_ur:
        typeof dua.translation_ur === "string"
          ? dua.translation_ur.trim()
          : "",
      reference:
        typeof dua.reference === "string" ? dua.reference.trim() : "",
    }))
    .filter(
      (dua) =>
        dua.title ||
        dua.arabic ||
        dua.translation_en ||
        dua.translation_ur ||
        dua.reference
    );
};

export const generateResponse = async (req, res) => {
  try {
    const { chatId, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      chat = await Chat.create({
        userId: req.user._id,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt,
      });
    }

    if (chat.messages.length === 0) {
      chat.title = prompt.length > 40 ? `${prompt.substring(0, 40).trim()}...` : prompt.trim();
    }

    const userMessage = { role: 'user', content: prompt };
    chat.messages.push(userMessage);
    await chat.save();

    try {
      const guidanceData = await getIslamicGuidance(prompt);
      const ayahKeys = extractAyahKeys(guidanceData);
      console.log('Extracted Ayah Keys:', ayahKeys);
      const ayahsData = await fetchAyahsData(ayahKeys);

      const assistantMessage = {
        role: 'assistant',
        content:
          typeof guidanceData?.user_intent === 'string' ? guidanceData.user_intent.trim() : '',
        explanation: buildExplanation(guidanceData),
        ayahs: ayahsData,
        hadiths: normalizeHadiths(guidanceData?.hadiths),
        duas: normalizeDuas(guidanceData?.duas),
      };
      console.log('Generated Assistant Message:', assistantMessage);
      chat.messages.push(assistantMessage);
      await chat.save();

      return res.json({ chat, newMessage: assistantMessage });
    } catch (aiError) {
      console.error('AI/Quran API Failure:', aiError);

      const fallbackMessage = {
        role: 'assistant',
        explanation: 'I genuinely apologize, but I encountered an error while trying to generate guidance for you. Your words have been saved in our chat context, so please try again or rephrase your prompt.',
        ayahs: [],
        hadiths: [],
        duas: [],
      };

      chat.messages.push(fallbackMessage);
      await chat.save();

      return res.json({ chat, newMessage: fallbackMessage });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error processing your request' });
  }
};
