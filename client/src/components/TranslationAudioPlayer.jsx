import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Languages } from 'lucide-react';

const URDU_LANG_PREFIXES = ['ur', 'ur-PK', 'ur-IN'];

const pickBestVoice = (voices, lang) => {
  if (!voices.length) return null;

  const normalizedLang = lang.toLowerCase();

  return (
    voices.find((voice) => voice.lang?.toLowerCase() === normalizedLang) ||
    voices.find((voice) => URDU_LANG_PREFIXES.includes(voice.lang)) ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('ur')) ||
    voices.find((voice) => voice.default) ||
    voices[0]
  );
};

const TranslationAudioPlayer = ({ text, lang = 'ur-PK', title = 'Urdu Translation Audio' }) => {
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voicesChecked, setVoicesChecked] = useState(false);
  const [error, setError] = useState('');

  const selectedVoice = useMemo(() => pickBestVoice(voices, lang), [voices, lang]);
  const hasUrduVoice = useMemo(
    () => voices.some((voice) => voice.lang?.toLowerCase().startsWith('ur')),
    [voices],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    synthRef.current = synth;
    setIsSupported(true);

    const updateVoices = () => {
      const availableVoices = synth.getVoices() || [];
      setVoices(availableVoices);
      setVoicesChecked(true);
    };

    updateVoices();
    synth.onvoiceschanged = updateVoices;

    return () => {
      synth.cancel();
      if (synth.onvoiceschanged === updateVoices) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setError('');

    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, [text]);

  const togglePlayback = () => {
    if (!isSupported || !text || !synthRef.current) return;

    const synth = synthRef.current;

    if (isPlaying || synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    try {
      synth.cancel();

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = selectedVoice?.lang || lang;
      utterance.voice = selectedVoice || null;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setError('');
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Urdu translation speech failed:', event);
        setIsPlaying(false);
        setError('Urdu translation audio could not be played on this device.');
      };

      utteranceRef.current = utterance;
      synth.speak(utterance);
    } catch (playError) {
      console.error('Translation speech playback failed:', playError);
      setIsPlaying(false);
      setError('Failed to play Urdu translation audio.');
    }
  };

  if (!text) return null;

  if (!isSupported) {
    return null;
  }

  if (voicesChecked && !hasUrduVoice) return null;

  return (
    <div className="flex flex-col gap-2 bg-background border border-custom p-3 rounded-[2rem] w-full md:w-auto md:min-w-[300px]">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayback}
          disabled={!isSupported}
          className="w-10 h-10 flex shrink-0 items-center justify-center bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          aria-label={isPlaying ? 'Pause Urdu translation audio' : 'Play Urdu translation audio'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text truncate">{title}</div>
          <div className="text-xs text-muted truncate">
            {hasUrduVoice ? `Voice: ${selectedVoice?.name || 'Urdu'}` : 'Loading Urdu voice...'}
          </div>
        </div>

        <Languages className="w-4 h-4 text-muted shrink-0 mr-2" />
      </div>

      {error && <p className="px-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default TranslationAudioPlayer;
