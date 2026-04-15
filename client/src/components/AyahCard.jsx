import React, { useState } from 'react';
import { Copy, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import TranslationAudioPlayer from './TranslationAudioPlayer';

const AyahCard = ({ ayah }) => {
  const [showTafsir, setShowTafsir] = useState(false);
  const [copied, setCopied] = useState(false);
  const englishTranslation = ayah.translationEnglish || ayah.translations?.english || ayah.translation || '';
  const urduTranslation = ayah.translationUrdu || ayah.translations?.urdu || '';
  const audioUrl = ayah.audioUrl || ayah.audio?.url || '';

  // Note: Assuming ayah object has: ayahKey, arabicText, translation, tafsir, audioUrl, surahName

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${ayah.arabicText}\n\n${englishTranslation}\n\n${urduTranslation}\n- Quran ${ayah.ayahKey}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Strip basic html tags if any are in tafsir
  const cleanTafsir = ayah.tafsir ? ayah.tafsir.replace(/<[^>]*>?/gm, '') : '';

  return (
    <div className="bg-surface border border-custom rounded-2xl overflow-hidden shadow-sm transition-all hover:border-primary/30">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full w-fit">
              {ayah.surahName} • Ayah {ayah.ayahKey.split(':')[1]}
            </span>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 text-muted hover:text-primary transition-colors rounded-lg bg-background"
            title="Copy Ayah"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-3xl md:text-4xl text-right font-arabic leading-[2.5]" dir="rtl">
            {ayah.arabicText}
          </p>
          {englishTranslation && (
            <p className="text-lg text-text border-l-4 border-primary pl-4 py-1 italic">
              "{englishTranslation}"
            </p>
          )}
          {urduTranslation && (
            <div className="rounded-2xl bg-background border border-custom px-5 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80">Urdu Translation</p>
              <p className="text-right text-lg leading-loose text-text" dir="rtl">
                {urduTranslation}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-t border-custom px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {audioUrl && <AudioPlayer audioUrl={audioUrl} title={`Recitation ${ayah.ayahKey}`} />}
          {urduTranslation && (
            <TranslationAudioPlayer
              text={urduTranslation}
              lang="ur-PK"
              title={`Urdu Translation ${ayah.ayahKey}`}
            />
          )}
        </div>
        
        {cleanTafsir && (
          <button 
            onClick={() => setShowTafsir(!showTafsir)}
            className="text-sm font-medium text-primary flex items-center justify-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors md:ml-auto"
          >
            {showTafsir ? 'Hide Tafseer' : 'Read Tafseer'}
            {showTafsir ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {showTafsir && cleanTafsir && (
        <div className="border-t border-custom bg-surface p-6">
          <h5 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Tafseer (Explanation)</h5>
          <div className="text-sm text-text leading-relaxed prose prose-invert max-w-none">
            {/* simple truncate if extremely long, or just let it scroll */}
            <p className="whitespace-pre-line">{cleanTafsir.substring(0, 1500)}{cleanTafsir.length > 1500 ? '...' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyahCard;
