import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const AudioPlayer = ({ audioUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setProgress(0);
    setError('');
    audio.pause();
    audio.load();

    const updateProgress = () => {
      const current = audio.currentTime;
      const duration = audio.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setError('');
    };

    const handleError = () => {
      setIsPlaying(false);
      setError('Unable to load recitation.');
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      setError('');
      await audio.play();
    } catch (playError) {
      console.error('Audio playback failed:', playError);
      setIsPlaying(false);
      setError('Playback failed. Please try again.');
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekPosition = (e.target.value / 100) * audio.duration;
    if (isFinite(seekPosition)) {
      audio.currentTime = seekPosition;
      setProgress(e.target.value);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="flex flex-col gap-2 bg-background border border-custom p-3 rounded-[2rem] w-full md:w-auto md:min-w-[300px]">
      <div className="flex items-center gap-4">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex shrink-0 items-center justify-center bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-sm"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
      </button>

      <div className="flex-1 flex flex-col gap-1 w-full relative">
        <div className="text-xs font-semibold text-text truncate max-w-[150px]">
          {title || 'Recitation'}
        </div>
        <input 
          type="range" 
          title="Seek Recitation"
          value={isNaN(progress) ? 0 : progress} 
          onChange={handleSeek}
          className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
        />
        <div 
          className="absolute bottom-0 left-0 h-1 bg-primary rounded-l-lg pointer-events-none" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <Volume2 className="w-4 h-4 text-muted shrink-0 mr-2" />
      <audio ref={audioRef} src={audioUrl} preload="none" />
      </div>
      {error && <p className="px-2 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default AudioPlayer;
