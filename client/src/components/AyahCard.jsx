import React, { useState } from "react";
import { Copy, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import AudioPlayer from "./AudioPlayer";
import TranslationAudioPlayer from "./TranslationAudioPlayer";

const AyahCard = ({ ayah }) => {
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);
  const arabicText =
    ayah.arabicText || ayah.textUthmani || ayah.text || ayah.arabic || "";
  const englishTranslation =
    ayah.translationEnglish ||
    ayah.englishTranslation ||
    ayah.translations?.english ||
    ayah.translation_en ||
    ayah.translation ||
    "";
  const urduTranslation =
    ayah.translationUrdu ||
    ayah.urduTranslation ||
    ayah.translations?.urdu ||
    ayah.translation_ur ||
    "";
  const tafsirText =
    ayah.tafsir || ayah.tafseer || ayah.tafsirText || ayah.explanation || "";
  const audioUrl =
    ayah.audioUrl || ayah.audio?.url || ayah.audio?.audioUrl || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${arabicText}\n\n${urduTranslation}\n\n${englishTranslation}\n- Quran ${ayah.ayahKey}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strip basic html tags if any are in tafsir
  const cleanTafsir = tafsirText ? tafsirText.replace(/<[^>]*>?/gm, "") : "";

  return (
    <div className="bg-surface border border-custom rounded-2xl md:rounded-4xl overflow-hidden shadow-2xl shadow-primary/10 transition-all hover:border-primary/40">
      <div className="p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {ayah.surahName} • Ayah {ayah.ayahKey.split(":")[1]}
            </span>
            <p className="text-sm text-text-muted max-w-2xl">
              {ayah.surahName} ({ayah.ayahKey}) guidance, recitation and tafseer
              in a clean verse card.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center rounded-2xl border border-custom bg-background px-4 py-3 text-text transition hover:border-primary hover:text-primary"
            title="Copy Ayah"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="ml-2 text-xs font-semibold uppercase tracking-[0.24em]">
              Copy
            </span>
          </button>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="rounded-2xl md:rounded-4xl bg-background/80 border border-custom px-4 md:px-6 py-5 md:py-7 shadow-sm">
            <p
              className="text-xl md:text-2xl lg:text-3xl text-right font-arabic leading-[2.2] tracking-[0.02em]"
              dir="rtl"
            >
              {arabicText}
            </p>
          </div>

          {urduTranslation && (
            <div className="rounded-2xl md:rounded-4xl bg-[#0b1728] border border-primary/10 px-4 md:px-5 py-4 md:py-5 shadow-inner">
              <p className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-primary/70">
                Urdu Translation
              </p>
              <p
                className="text-lg md:text-2xl text-right leading-relaxed text-text font-urdu"
                dir="rtl"
              >
                {urduTranslation}
              </p>
            </div>
          )}

          {englishTranslation && (
            <div className="rounded-2xl md:rounded-4xl bg-background border border-custom px-4 md:px-5 py-4 md:py-5 shadow-sm">
              <p className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-primary/70">
                English Translation
              </p>
              <p className="text-base md:text-lg text-text italic leading-relaxed">
                "{englishTranslation}"
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-t border-custom px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center w-full">
          {audioUrl && (
            <AudioPlayer
              audioUrl={audioUrl}
              title={`Recitation ${ayah.ayahKey}`}
            />
          )}
          {urduTranslation && (
            <TranslationAudioPlayer
              text={urduTranslation}
              lang="ur-PK"
              title={`Urdu Translation ${ayah.ayahKey}`}
            />
          )}
        </div>

        {cleanTafsir ? (
          <button
            onClick={() => setShowTafsir(!showTafsir)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-transparent px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10 md:ml-auto"
          >
            {showTafsir ? "Hide Tafseer" : "Show Tafseer"}
            {showTafsir ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="text-xs text-muted italic md:ml-auto">
            Tafseer not available
          </div>
        )}
      </div>

      {showTafsir && cleanTafsir && (
        <div className="border-t border-custom bg-surface p-4 md:p-6">
          <h5 className="text-sm font-semibold text-muted mb-2 md:mb-3 uppercase tracking-wider">
            Tafseer (Explanation)
          </h5>
          <div className="text-sm text-text leading-relaxed prose prose-invert max-w-none">
            {/* simple truncate if extremely long, or just let it scroll */}
            <p className="whitespace-pre-line">
              {cleanTafsir.substring(0, 1500)}
              {cleanTafsir.length > 1500 ? "..." : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyahCard;
