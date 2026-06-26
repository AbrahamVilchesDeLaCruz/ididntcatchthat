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
  const [completeError, setCompleteError] = useState<string | null>(null);

  const { data: flashcards = [], isLoading } = useGameFlashcards(gameId ?? '');
  const { mutateAsync: recordAttempt } = useRecordAttempt(gameId ?? '');
  const { mutate: completeGame, isPending: isCompleting } = useCompleteGame();

  useEffect(() => {
    if (!hasFlashcardIds) {
      void navigate('/game', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentFlashcard = flashcards[currentIndex] ?? null;

  const navigateToSummary = (summary: GameSummaryVM): void => {
    if (gameId) saveGameSummary(gameId, summary);
    void navigate(`/game/${gameId ?? ''}/summary`, {
      state: { summary },
      replace: true,
    });
  };

  const handleFlip = (): void => {
    setIsFlipped((prev) => !prev);
  };

  const runCompleteGame = (): void => {
    if (!gameId) return;
    setCompleteError(null);
    completeGame(gameId, {
      onSuccess: navigateToSummary,
      onError: () => {
        setCompleteError(
          'No se pudo finalizar la partida. Reintenta o continúa jugando.',
        );
      },
    });
  };

  const handleAnswer = (correct: boolean): void => {
    if (!currentFlashcard) return;

    const isLast = currentIndex === flashcards.length - 1;

    const afterAttemptRecorded = (): void => {
      if (isLast) {
        runCompleteGame();
      } else {
        setIsFlipped(false);
        requestAnimationFrame(() => {
          setCurrentIndex((prev) => prev + 1);
        });
      }
    };

    void recordAttempt({ flashcardId: currentFlashcard.id, correct })
      .then(() => afterAttemptRecorded())
      .catch(() => {
        setCompleteError('No se pudo registrar la respuesta. Reintenta.');
      });
  };

  if (completeError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-5 py-16">
        <p className="text-center text-[var(--color-accent-red)]">
          {completeError}
        </p>
        <button
          type="button"
          onClick={() => {
            if (currentIndex === flashcards.length - 1) {
              runCompleteGame();
            } else {
              setCompleteError(null);
            }
          }}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

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
