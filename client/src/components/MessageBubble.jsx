import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import AyahCard from "./AyahCard";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end w-full"
      >
        <div className="bg-primary text-white px-4 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-sm max-w-[90%] md:max-w-[85%] lg:max-w-[70%] shadow-md">
          <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  // Assistant Message
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start w-full"
    >
      <div className="w-full max-w-[95%] md:max-w-[90%] lg:max-w-[85%] space-y-4 md:space-y-6">
        {/* Explanation */}
        {message.explanation && (
          <div className="bg-surface border border-custom px-4 py-4 md:px-6 md:py-5 rounded-2xl rounded-tl-sm shadow-sm prose prose-invert max-w-none text-text leading-relaxed">
            <ReactMarkdown>{message.explanation}</ReactMarkdown>
          </div>
        )}

        {/* Ayahs */}
        {message.ayahs && message.ayahs.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2 px-2">
              <span className="w-6 h-px bg-muted"></span>
              Revealed Guidance
            </h4>
            {message.ayahs.map((ayah, idx) => (
              <AyahCard key={idx} ayah={ayah} />
            ))}
          </div>
        )}

        {/* Hadiths */}
        {message.hadiths && message.hadiths.length > 0 && (
          <div className="space-y-3 md:space-y-4 mt-4 md:mt-6">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2 px-2">
              <span className="w-6 h-px bg-muted"></span>
              Authentic Hadith
            </h4>
            <div className="grid gap-3 md:gap-4 md:grid-cols-1">
              {message.hadiths.map((hadith, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-custom p-4 md:p-6 rounded-2xl glass-panel group shadow-sm transition-all hover:border-primary/30"
                >
                  {hadith.arabic && (
                    <p
                      className="text-lg md:text-xl lg:text-2xl font-arabic text-right mb-3 md:mb-5 leading-loose text-primary"
                      dir="rtl"
                    >
                      {hadith.arabic}
                    </p>
                  )}
                  <p className="text-sm md:text-base text-text mb-3 md:mb-4 leading-relaxed border-l-4 border-primary pl-3 md:pl-4 py-1 italic">
                    "{hadith.translation}"
                  </p>
                  <p className="text-xs text-muted font-medium bg-background inline-block px-2 md:px-3 py-1 md:py-1.5 rounded-md border border-custom">
                    {hadith.reference}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duas */}
        {message.duas && message.duas.length > 0 && (
          <div className="space-y-4 mt-6">
            <h4 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-px bg-muted"></span>
              Dua
            </h4>
            <div className="grid gap-3 md:gap-4 md:grid-cols-2">
              {message.duas.map((dua, idx) => (
                <div
                  key={idx}
                  className="bg-background border border-custom p-4 md:p-5 rounded-2xl glass-panel group"
                >
                  {dua.title && (
                    <p className="text-sm font-semibold text-primary mb-2 md:mb-3 uppercase tracking-wide">
                      {dua.title}
                    </p>
                  )}
                  {dua.arabic && (
                    <p
                      className="text-lg md:text-xl font-arabic text-right mb-3 md:mb-4 leading-loose text-primary"
                      dir="rtl"
                    >
                      {dua.arabic}
                    </p>
                  )}
                  {(dua.translation_en || dua.translation) && (
                    <div className="mb-2 md:mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                        English
                      </p>
                      <p className="text-sm text-text leading-relaxed">
                        "{dua.translation_en || dua.translation}"
                      </p>
                    </div>
                  )}
                  {dua.translation_ur && (
                    <div className="mb-2 md:mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                        Urdu
                      </p>
                      <p
                        className="text-sm text-text leading-relaxed font-urdu"
                        dir="rtl"
                      >
                        "{dua.translation_ur}"
                      </p>
                    </div>
                  )}
                  {dua.reference && (
                    <p className="text-xs text-muted font-medium bg-surface inline-block px-2 py-1 rounded">
                      {dua.reference}
                    </p>
                  )}
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
