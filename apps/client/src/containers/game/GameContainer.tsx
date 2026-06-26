import { type ReactElement, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import {
  useGameFlashcards,
  useRecordAttempt,
  useCompleteGame,
  usePatchGame,
} from './api/game.api';
import { GameComponent } from './GameComponent';
import { RepeatWrongAnswersModal } from './components/RepeatWrongAnswersModal';
import { useGameSession } from './hooks/useGameSession';
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
  const userType = useAuthStore((s) => s.userType);

  const hasFlashcardIds = (state.flashcardIds ?? []).length > 0;
  const canPause = userType !== null && userType !== 'guest';

  const [completeError, setCompleteError] = useState<string | null>(null);

  const { data: flashcards = [], isLoading } = useGameFlashcards(gameId ?? '');
  const { mutateAsync: recordAttempt } = useRecordAttempt(gameId ?? '');
  const { mutate: completeGame, isPending: isCompleting } = useCompleteGame();
  const { mutate: patchGame, isPending: isPausing } = usePatchGame();

  useEffect(() => {
    if (!hasFlashcardIds) {
      void navigate('/game', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToSummary = (summary: GameSummaryVM): void => {
    if (gameId) saveGameSummary(gameId, summary);
    void navigate(`/game/${gameId ?? ''}/summary`, {
      state: { summary },
      replace: true,
    });
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

  const session = useGameSession({
    flashcards,
    onOriginalQueueComplete: runCompleteGame,
  });

  const handleAnswer = (correct: boolean): void => {
    const flashcard = session.currentFlashcard;
    if (!flashcard) return;

    void recordAttempt({ flashcardId: flashcard.id, correct })
      .then(() => session.recordAnswer(correct))
      .catch(() => {
        setCompleteError('No se pudo registrar la respuesta. Reintenta.');
      });
  };

  const handlePause = (): void => {
    if (!gameId || !session.currentFlashcard || !canPause) return;
    patchGame(
      {
        gameId,
        payload: {
          status: 'paused',
          lastFlashcardId: session.currentFlashcard.id,
        },
      },
      {
        onSuccess: () => {
          void navigate('/game');
        },
      },
    );
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
            setCompleteError(null);
            runCompleteGame();
          }}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      {session.phase === 'repeat-prompt' && (
        <RepeatWrongAnswersModal
          count={session.wrongCount}
          onAccept={session.acceptRepeatWrong}
          onDecline={session.declineRepeatWrong}
        />
      )}
      <GameComponent
        flashcard={session.currentFlashcard}
        isLoading={isLoading || isCompleting || isPausing}
        isFlipped={session.isFlipped}
        currentIndex={session.currentIndex}
        totalCount={session.totalCount}
        canPause={canPause}
        onFlip={session.toggleFlip}
        onAnswer={handleAnswer}
        onPause={handlePause}
      />
    </>
  );
};
