import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import AyahCard from './AyahCard';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end w-full">
        <div className="bg-primary text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] shadow-md">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  // Assistant Message
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start w-full">
      <div className="w-full max-w-[90%] md:max-w-[85%] space-y-6">
        
        {/* Explanation */}
        {message.explanation && (
          <div className="bg-surface border border-custom px-6 py-5 rounded-2xl rounded-tl-sm shadow-sm prose prose-invert max-w-none text-text leading-relaxed">
            <ReactMarkdown>{message.explanation}</ReactMarkdown>
          </div>
        )}

        {/* Ayahs */}
        {message.ayahs && message.ayahs.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-[1px] bg-muted"></span> 
              Revealed Guidance
            </h4>
            {message.ayahs.map((ayah, idx) => (
              <AyahCard key={idx} ayah={ayah} />
            ))}
          </div>
        )}

        {/* Hadiths */}
        {message.hadiths && message.hadiths.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-[1px] bg-muted"></span> 
              Authentic Hadith
            </h4>
            <div className="grid gap-4 md:grid-cols-1">
              {message.hadiths.map((hadith, idx) => (
                <div key={idx} className="bg-surface border border-custom p-6 rounded-2xl glass-panel group shadow-sm transition-all hover:border-primary/30">
                  {hadith.arabic && (
                     <p className="text-xl md:text-2xl font-arabic text-right mb-5 leading-loose text-primary" dir="rtl">{hadith.arabic}</p>
                  )}
                  <p className="text-sm md:text-base text-text mb-4 leading-relaxed border-l-4 border-primary pl-4 py-1 italic">"{hadith.translation}"</p>
                  <p className="text-xs text-muted font-medium bg-background inline-block px-3 py-1.5 rounded-md border border-custom">{hadith.reference}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duas */}
        {message.duas && message.duas.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-[1px] bg-muted"></span> 
              Supplications
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              {message.duas.map((dua, idx) => (
                <div key={idx} className="bg-background border border-custom p-5 rounded-2xl glass-panel group">
                  <p className="text-xl font-arabic text-right mb-4 leading-loose text-primary" dir="rtl">{dua.arabic}</p>
                  <p className="text-sm text-text mb-3 leading-relaxed">"{dua.translation}"</p>
                  <p className="text-xs text-muted font-medium bg-surface inline-block px-2 py-1 rounded">{dua.reference}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default MessageBubble;
