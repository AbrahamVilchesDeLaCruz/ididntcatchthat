import { useCallback, useRef, type MouseEvent } from 'react';

export function useFlashcardAudio(): {
  playAudio: (url: string, event?: MouseEvent) => void;
} {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((url: string, event?: MouseEvent): void => {
    event?.stopPropagation();
    if (!url) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      void audioRef.current.play();
      return;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    void audio.play();
  }, []);

  return { playAudio };
}
