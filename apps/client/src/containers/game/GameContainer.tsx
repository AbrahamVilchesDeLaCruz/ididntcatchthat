import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import {
  useGameFlashcards,
  useRecordAttempt,
  useCompleteGame,
  usePatchGame,
  useResumeGame,
} from './api/game.api';
import { GameComponent } from './GameComponent';
import { RepeatWrongAnswersModal } from './components/RepeatWrongAnswersModal';
import { useGameSession } from './hooks/useGameSession';
import { useGameKeyboardShortcuts } from './hooks/useGameKeyboardShortcuts';
import { saveGameSummary } from './game-summary.storage';
import type { FlashcardGameVM, GameSummaryVM } from './game.types';

interface LocationState {
  flashcardIds?: string[];
  mode?: 'resume';
}

export const GameContainer = (): ReactElement => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const userType = useAuthStore((s) => s.userType);

  const hasFlashcardIds = (state.flashcardIds ?? []).length > 0;
  const isResumeMode = state.mode === 'resume' || !hasFlashcardIds;
  const canPause = userType !== null && userType !== 'guest';

  const [completeError, setCompleteError] = useState<string | null>(null);
  const [pauseError, setPauseError] = useState<string | null>(null);

  const { data: flashcards = [], isLoading: isLoadingFlashcards } =
    useGameFlashcards(gameId ?? '');
  const {
    data: resumeData,
    isLoading: isLoadingResume,
    isError: isResumeError,
  } = useResumeGame(gameId ?? '', isResumeMode && !!gameId);
  const { mutateAsync: recordAttempt } = useRecordAttempt(gameId ?? '');
  const { mutate: completeGame, isPending: isCompleting } = useCompleteGame();
  const { mutate: patchGame, isPending: isPausing } = usePatchGame();

  useEffect(() => {
    if (isResumeMode && isResumeError) {
      void navigate('/game', { replace: true });
    }
  }, [isResumeMode, isResumeError, navigate]);

  const sessionFlashcards = useMemo((): FlashcardGameVM[] => {
    if (!isResumeMode || !resumeData) {
      return flashcards;
    }
    const pendingSet = new Set(resumeData.pendingFlashcardIds);
    return flashcards.filter((f) => pendingSet.has(f.id));
  }, [flashcards, isResumeMode, resumeData]);

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
    flashcards: sessionFlashcards,
    onOriginalQueueComplete: runCompleteGame,
  });

  const isLoading =
    isLoadingFlashcards ||
    (isResumeMode && isLoadingResume) ||
    isCompleting ||
    isPausing;

  const handleAnswer = useCallback(
    (correct: boolean): void => {
      const flashcard = session.currentFlashcard;
      if (!flashcard) return;

      void recordAttempt({ flashcardId: flashcard.id, correct })
        .then(() => session.recordAnswer(correct))
        .catch(() => {
          setCompleteError('No se pudo registrar la respuesta. Reintenta.');
        });
    },
    [recordAttempt, session],
  );

  const handlePause = useCallback((): void => {
    if (!gameId || !session.currentFlashcard || !canPause) return;
    setPauseError(null);
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
          void navigate('/game', { state: { pausedSaved: true } });
        },
        onError: () => {
          setPauseError('No se pudo pausar la partida. Reintenta.');
        },
      },
    );
  }, [canPause, gameId, navigate, patchGame, session.currentFlashcard]);

  const shortcutsEnabled =
    !isLoading && !!session.currentFlashcard && session.phase === 'playing';

  const onFlipShortcut = useCallback(() => {
    session.toggleFlip();
  }, [session]);

  const onCorrectShortcut = useCallback(() => {
    handleAnswer(true);
  }, [handleAnswer]);

  const onIncorrectShortcut = useCallback(() => {
    handleAnswer(false);
  }, [handleAnswer]);

  const onPauseShortcut = useCallback(() => {
    handlePause();
  }, [handlePause]);

  useGameKeyboardShortcuts({
    enabled: shortcutsEnabled,
    isFlipped: session.isFlipped,
    onFlip: onFlipShortcut,
    onCorrect: onCorrectShortcut,
    onIncorrect: onIncorrectShortcut,
    onPause: canPause ? onPauseShortcut : undefined,
  });

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
      {pauseError ? (
        <div className="bg-[var(--color-accent-red)]/10 px-5 py-2 text-center text-sm text-[var(--color-accent-red)]">
          {pauseError}
        </div>
      ) : null}
      <GameComponent
        flashcard={session.currentFlashcard}
        isLoading={isLoading}
        isFlipped={session.isFlipped}
        currentIndex={session.currentIndex}
        totalCount={session.totalCount}
        correctCount={session.correctCount}
        incorrectCount={session.incorrectCount}
        canPause={canPause}
        onFlip={session.toggleFlip}
        onAnswer={handleAnswer}
        onPause={handlePause}
      />
    </>
  );
};
