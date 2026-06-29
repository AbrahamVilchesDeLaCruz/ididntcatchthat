import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useCompleteStudy,
  useGameFlashcards,
  usePatchGame,
  useRecordView,
  useResumeGame,
} from './api/study.api';
import { StudyComponent } from './StudyComponent';
import { useStudySession } from './hooks/useStudySession';
import type { StudySummaryVM } from './study.types';
import type { FlashcardGameVM } from '@/containers/game/game.types';
import { useStudyAuthGuard } from './hooks/useStudyAuthGuard';

interface LocationState {
  flashcardIds?: string[];
  mode?: 'resume';
}

export const StudyContainer = (): ReactElement => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const { isReady, canStudy } = useStudyAuthGuard();

  const hasFlashcardIds = (state.flashcardIds ?? []).length > 0;
  const isResumeMode = state.mode === 'resume' || !hasFlashcardIds;
  const canPause = canStudy;

  const [completeError, setCompleteError] = useState<string | null>(null);
  const [pauseError, setPauseError] = useState<string | null>(null);
  const completeRef = useRef<() => void>(() => undefined);

  const { data: flashcards = [], isLoading: isLoadingFlashcards } =
    useGameFlashcards(sessionId ?? '');
  const {
    data: resumeData,
    isLoading: isLoadingResume,
    isError: isResumeError,
  } = useResumeGame(sessionId ?? '', isResumeMode && !!sessionId);
  const { mutateAsync: recordView } = useRecordView(sessionId ?? '');
  const { mutate: completeStudy, isPending: isCompleting } = useCompleteStudy();
  const { mutate: patchGame, isPending: isPausing } = usePatchGame();

  useEffect(() => {
    if (isResumeMode && isResumeError) {
      void navigate('/study', { replace: true });
    }
  }, [isResumeMode, isResumeError, navigate]);

  const sessionFlashcards = useMemo((): FlashcardGameVM[] => {
    if (!isResumeMode || !resumeData) {
      return flashcards;
    }
    const pendingSet = new Set(resumeData.pendingFlashcardIds);
    return flashcards.filter((f) => pendingSet.has(f.id));
  }, [flashcards, isResumeMode, resumeData]);

  const navigateToSummary = useCallback(
    (summary: StudySummaryVM): void => {
      void navigate(`/study/${sessionId ?? ''}/summary`, {
        state: { summary },
        replace: true,
      });
    },
    [navigate, sessionId],
  );

  const session = useStudySession({
    flashcards: sessionFlashcards,
    onSessionComplete: () => completeRef.current(),
  });

  const runCompleteStudy = useCallback((): void => {
    if (!sessionId) return;
    setCompleteError(null);
    completeStudy(sessionId, {
      onSuccess: navigateToSummary,
      onError: () => {
        setCompleteError('No se pudo finalizar la sesión. Reintenta.');
      },
    });
  }, [completeStudy, navigateToSummary, sessionId]);

  useEffect(() => {
    completeRef.current = runCompleteStudy;
  }, [runCompleteStudy]);

  const handleNext = useCallback((): void => {
    const flashcard = session.currentFlashcard;
    if (!flashcard) return;

    void recordView({ flashcardId: flashcard.id })
      .then(() => session.recordViewAndAdvance())
      .catch(() => {
        setCompleteError('No se pudo registrar la vista. Reintenta.');
      });
  }, [recordView, session]);

  const handlePause = useCallback((): void => {
    if (!sessionId || !session.currentFlashcard || !canPause) return;
    setPauseError(null);
    patchGame(
      {
        gameId: sessionId,
        payload: {
          status: 'paused',
          lastFlashcardId: session.currentFlashcard.id,
        },
      },
      {
        onSuccess: () => {
          void navigate('/study', { state: { pausedSaved: true } });
        },
        onError: () => {
          setPauseError('No se pudo pausar la sesión. Reintenta.');
        },
      },
    );
  }, [canPause, navigate, patchGame, session.currentFlashcard, sessionId]);

  const isLoading =
    !isReady ||
    !canStudy ||
    isLoadingFlashcards ||
    (isResumeMode && isLoadingResume) ||
    isCompleting ||
    isPausing;

  if (!isReady || !canStudy) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

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
            runCompleteStudy();
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
      {pauseError ? (
        <div className="bg-[var(--color-accent-red)]/10 px-5 py-2 text-center text-sm text-[var(--color-accent-red)]">
          {pauseError}
        </div>
      ) : null}
      <StudyComponent
        flashcard={session.currentFlashcard}
        isLoading={isLoading}
        isFlipped={session.isFlipped}
        currentIndex={session.currentIndex}
        totalCount={session.totalCount}
        viewedCount={session.viewedCount}
        canPause={canPause}
        onFlip={session.toggleFlip}
        onNext={handleNext}
        onPause={handlePause}
      />
    </>
  );
};
