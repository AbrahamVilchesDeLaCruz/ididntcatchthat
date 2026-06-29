import { useCallback, useMemo, useState } from 'react';
import type { FlashcardGameVM } from '@/containers/game/game.types';

interface UseStudySessionParams {
  flashcards: FlashcardGameVM[];
  onSessionComplete: () => void;
}

interface UseStudySessionResult {
  currentIndex: number;
  isFlipped: boolean;
  activeFlashcards: FlashcardGameVM[];
  totalCount: number;
  currentFlashcard: FlashcardGameVM | null;
  viewedCount: number;
  setIsFlipped: (flipped: boolean) => void;
  toggleFlip: () => void;
  recordViewAndAdvance: () => void;
}

export function useStudySession({
  flashcards,
  onSessionComplete,
}: UseStudySessionParams): UseStudySessionResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCount, setViewedCount] = useState(0);

  const activeFlashcards = useMemo(() => flashcards, [flashcards]);
  const totalCount = activeFlashcards.length;
  const currentFlashcard = activeFlashcards[currentIndex] ?? null;

  const recordViewAndAdvance = useCallback((): void => {
    if (!currentFlashcard) return;

    const nextViewed = viewedCount + 1;
    setViewedCount(nextViewed);

    const isLast = currentIndex >= activeFlashcards.length - 1;
    if (!isLast) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    onSessionComplete();
  }, [
    activeFlashcards.length,
    currentFlashcard,
    currentIndex,
    onSessionComplete,
    viewedCount,
  ]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return {
    currentIndex,
    isFlipped,
    activeFlashcards,
    totalCount,
    currentFlashcard,
    viewedCount,
    setIsFlipped,
    toggleFlip,
    recordViewAndAdvance,
  };
}
