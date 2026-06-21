import { type ReactElement, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  useGameFlashcards,
  useRecordAttempt,
  useCompleteGame,
} from './api/game.api';
import { GameComponent } from './GameComponent';
import { saveGameSummary } from './game-summary.storage';
import type { GameSummaryVM } from './game.types';

interface LocationState {
  flashcardIds?: string[];
}

export const GameContainer = (): ReactElement => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const hasFlashcardIds = (state.flashcardIds ?? []).length > 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const { data: flashcards = [], isLoading } = useGameFlashcards(gameId ?? '');
  const { mutateAsync: recordAttempt } = useRecordAttempt(gameId ?? '');
  const { mutate: completeGame, isPending: isCompleting } = useCompleteGame();

  // If no flashcardIds in state, redirect back to config
  useEffect(() => {
    if (!hasFlashcardIds) {
      void navigate('/game', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFlashcard = flashcards[currentIndex] ?? null;

  const handleFlip = (): void => {
    setIsFlipped((prev) => !prev);
  };

  const handleAnswer = (correct: boolean): void => {
    if (!currentFlashcard) return;

    const isLast = currentIndex === flashcards.length - 1;

    const afterAttemptRecorded = (): void => {
      if (isLast) {
        completeGame(gameId ?? '', {
          onSuccess: (summary: GameSummaryVM) => {
            if (gameId) saveGameSummary(gameId, summary);
            void navigate(`/game/${gameId ?? ''}/summary`, {
              state: { summary },
              replace: true,
            });
          },
          onError: () => {
            void navigate(`/game/${gameId ?? ''}/summary`, { replace: true });
          },
        });
      } else {
        // Reset flip first, advance index on next frame so the card
        // transition starts from the front face
        setIsFlipped(false);
        requestAnimationFrame(() => {
          setCurrentIndex((prev) => prev + 1);
        });
      }
    };

    void recordAttempt({ flashcardId: currentFlashcard.id, correct })
      .then(() => afterAttemptRecorded())
      .catch(() => {
        if (isLast) {
          void navigate(`/game/${gameId ?? ''}/summary`, { replace: true });
        }
      });
  };

  return (
    <GameComponent
      flashcard={currentFlashcard}
      isLoading={isLoading || isCompleting}
      isFlipped={isFlipped}
      currentIndex={currentIndex}
      totalCount={flashcards.length}
      onFlip={handleFlip}
      onAnswer={handleAnswer}
    />
  );
};
