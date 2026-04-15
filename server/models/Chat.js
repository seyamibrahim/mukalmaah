import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String }, // Optional, could be empty if only returning structured data
  ayahs: [{
    ayahKey: String,         // e.g. "2:286"
    arabicText: String,
    translation: String,
    translationEnglish: String,
    translationUrdu: String,
    translations: {
      english: String,
      urdu: String
    },
    tafsir: String,
    tafseer: String,
    audioUrl: String,
    audio: {
      url: String,
      format: String,
      reciterId: String
    },
    tafsirMeta: {
      resourceId: Number,
      resourceName: String,
      languageName: String
    },
    surahName: String
  }],
  duas: [{
    arabic: String,
    translation: String,
    reference: String
  }],
  hadiths: [{
    arabic: String,
    translation: String,
    reference: String
  }],
  explanation: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [MessageSchema]
}, { timestamps: true, collection: 'chats' });

const Chat = mongoose.model('Chat', ChatSchema);
export default Chat;
