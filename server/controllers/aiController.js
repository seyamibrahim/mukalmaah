import Chat from '../models/Chat.js';
import { getIslamicGuidance } from '../services/geminiService.js';
import { fetchAyahData } from '../services/quranApiService.js';

const extractAyahKeys = (geminiData) => {
  const structuredAyahs = Array.isArray(geminiData?.ayahs) ? geminiData.ayahs : [];
  const explanationMatches = typeof geminiData?.explanation === 'string'
    ? geminiData.explanation.match(/\b\d{1,3}:\d{1,3}\b/g) || []
    : [];

  return [...new Set([...structuredAyahs, ...explanationMatches].filter(Boolean))];
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
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
    } else {
      chat = await Chat.create({ userId: req.user._id, title: prompt.substring(0, 30) + '...' });
    }

    // If this is the first message in a pre-created chat, update title from prompt
    const isFirstMessage = chat.messages.length === 0;
    if (isFirstMessage) {
      // Use first 40 chars of the prompt as the title
      chat.title = prompt.length > 40 ? prompt.substring(0, 40).trim() + '...' : prompt.trim();
    }

    // Save user message FIRST
    const userMessage = { role: 'user', content: prompt };
    chat.messages.push(userMessage);
    await chat.save();

    try {

    // Call Gemini
    const geminiData = await getIslamicGuidance(prompt);
    
    // Fetch Quran Data for returned Ayahs
    const ayahKeys = extractAyahKeys(geminiData);

    const ayahsData = ayahKeys.length
      ? (await Promise.all(ayahKeys.map((key) => fetchAyahData(key)))).filter(Boolean)
      : [];

    // Compose Assistant Message
    const assistantMessage = {
      role: 'assistant',
      explanation: geminiData.explanation,
      ayahs: ayahsData,
      hadiths: geminiData.hadiths || [],
      duas: geminiData.duas || [],
    };
    
    chat.messages.push(assistantMessage);
    await chat.save();

      res.json({ chat, newMessage: assistantMessage });
    } catch (aiError) {
      console.error("AI/Quran API Failure:", aiError);
      
      // Push an apologetic fallback message so the chain isn't broken
      const fallbackMessage = {
        role: 'assistant',
        explanation: "I genuinely apologize, but I encountered an error while trying to generate guidance for you. Your profound words have been saved in our chat context—please try your prompt again or ask differently.",
        ayahs: [],
        hadiths: [],
        duas: [],
      };
      chat.messages.push(fallbackMessage);
      await chat.save();
      
      res.json({ chat, newMessage: fallbackMessage });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing your request' });
  }
};
