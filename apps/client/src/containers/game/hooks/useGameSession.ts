import { useCallback, useMemo, useState } from 'react';
import type { FlashcardGameVM } from '../game.types';

export type GameSessionPhase = 'playing' | 'repeat-prompt' | 'repeat';

interface UseGameSessionParams {
  flashcards: FlashcardGameVM[];
  onOriginalQueueComplete: () => void;
}

interface UseGameSessionResult {
  phase: GameSessionPhase;
  currentIndex: number;
  isFlipped: boolean;
  activeFlashcards: FlashcardGameVM[];
  totalCount: number;
  currentFlashcard: FlashcardGameVM | null;
  correctCount: number;
  incorrectCount: number;
  wrongCount: number;
  setIsFlipped: (flipped: boolean) => void;
  toggleFlip: () => void;
  recordAnswer: (correct: boolean) => void;
  acceptRepeatWrong: () => void;
  declineRepeatWrong: () => void;
}

export function useGameSession({
  flashcards,
  onOriginalQueueComplete,
}: UseGameSessionParams): UseGameSessionResult {
  const [phase, setPhase] = useState<GameSessionPhase>('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [repeatIds, setRepeatIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const activeFlashcards = useMemo(() => {
    if (phase === 'repeat') {
      return repeatIds
        .map((id) => flashcards.find((f) => f.id === id))
        .filter((f): f is FlashcardGameVM => f !== undefined);
    }
    return flashcards;
  }, [flashcards, phase, repeatIds]);

  const totalCount = activeFlashcards.length;
  const currentFlashcard = activeFlashcards[currentIndex] ?? null;

  const finishSession = useCallback(() => {
    onOriginalQueueComplete();
  }, [onOriginalQueueComplete]);

  const recordAnswer = useCallback(
    (correct: boolean) => {
      if (!currentFlashcard) return;

      let nextWrongCount = wrongIds.length;
      if (!correct && phase === 'playing') {
        if (!wrongIds.includes(currentFlashcard.id)) {
          nextWrongCount += 1;
        }
        setWrongIds((prev) =>
          prev.includes(currentFlashcard.id)
            ? prev
            : [...prev, currentFlashcard.id],
        );
      }

      if (correct) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }

      const isLast = currentIndex >= activeFlashcards.length - 1;
      if (!isLast) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
        return;
      }

      if (phase === 'playing' && nextWrongCount > 0) {
        setPhase('repeat-prompt');
        return;
      }

      finishSession();
    },
    [
      activeFlashcards.length,
      currentFlashcard,
      currentIndex,
      finishSession,
      phase,
      wrongIds,
    ],
  );

  const acceptRepeatWrong = useCallback(() => {
    setRepeatIds(wrongIds);
    setWrongIds([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setPhase('repeat');
  }, [wrongIds]);

  const declineRepeatWrong = useCallback(() => {
    finishSession();
  }, [finishSession]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  return {
    phase,
    currentIndex,
    isFlipped,
    activeFlashcards,
    totalCount,
    currentFlashcard,
    correctCount,
    incorrectCount,
    wrongCount: wrongIds.length,
    setIsFlipped,
    toggleFlip,
    recordAnswer,
    acceptRepeatWrong,
    declineRepeatWrong,
  };
}
