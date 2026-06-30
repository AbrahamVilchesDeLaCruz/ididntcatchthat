import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMaxPausedGamesError } from '@/core/api/apiError';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import { useAbandonGame } from '@/containers/game/api/game.api';
import { MaxPausedGamesModal } from '@/containers/game/components/MaxPausedGamesModal';
import { PausedGamesPanel } from '@/containers/game/components/PausedGamesPanel';
import { GameConfigComponent } from '@/containers/game/GameConfigComponent';
import type { GameModule } from '@/containers/game/api/game.api-model';
import { useCreateStudySession, usePausedGames } from './api/study.api';
import type { StartStudyPayload } from './study.types';
import { useStudyAuthGuard } from './hooks/useStudyAuthGuard';

type CardCount = 10 | 20 | 50;

interface LocationState {
  pausedSaved?: boolean;
}

export const StudyConfigContainer = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as LocationState | null) ?? {};
  const { isReady, canStudy } = useStudyAuthGuard();

  const { data: catalog } = useFlashcardCatalog();
  const { mutate: startStudy, isPending: isStarting } = useCreateStudySession();
  const { data: pausedGames = [] } = usePausedGames(canStudy);
  const { mutate: abandonGame, isPending: isAbandoning } = useAbandonGame();

  const [selectedModule, setSelectedModule] = useState<GameModule>('random');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [selectedCount, setSelectedCount] = useState<CardCount>(10);
  const [showMaxPausedModal, setShowMaxPausedModal] = useState(false);
  const [pendingStartPayload, setPendingStartPayload] =
    useState<StartStudyPayload | null>(null);
  const [showPausedSavedBanner] = useState(() => navState.pausedSaved === true);

  const studyPausedGames = useMemo(
    () => pausedGames.filter((g) => g.mode === 'study'),
    [pausedGames],
  );

  useEffect(() => {
    if (navState.pausedSaved) {
      void navigate('/study', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const launchStudy = (payload: StartStudyPayload): void => {
    startStudy(payload, {
      onSuccess: ({ gameId, flashcardIds }) => {
        setShowMaxPausedModal(false);
        setPendingStartPayload(null);
        void navigate(`/study/${gameId}`, {
          state: {
            flashcardIds,
            module: payload.module ?? null,
            cardCount: payload.cardCount,
          },
        });
      },
      onError: (error: unknown) => {
        if (isMaxPausedGamesError(error)) {
          setPendingStartPayload(payload);
          setShowMaxPausedModal(true);
        }
      },
    });
  };

  const handleStart = (): void => {
    const module = selectedModule === 'random' ? null : selectedModule;
    launchStudy({
      mode: 'study',
      module,
      subcategory: module === null ? null : selectedSubcategory,
      cardCount: selectedCount,
    });
  };

  const handleAbandonPaused = (gameId: string): void => {
    abandonGame(gameId, {
      onSuccess: () => {
        if (pendingStartPayload) {
          launchStudy(pendingStartPayload);
        }
      },
    });
  };

  if (!isReady || !canStudy) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {showMaxPausedModal ? (
        <MaxPausedGamesModal
          games={pausedGames}
          catalog={catalog}
          onAbandon={handleAbandonPaused}
          onClose={() => {
            setShowMaxPausedModal(false);
            setPendingStartPayload(null);
          }}
          isAbandoning={isAbandoning}
        />
      ) : null}

      <GameConfigComponent
        variant="study"
        selectedModule={selectedModule}
        selectedSubcategory={selectedSubcategory}
        selectedCount={selectedCount}
        catalog={catalog}
        isPending={isStarting}
        pausedSavedBanner={showPausedSavedBanner}
        pausedGamesPanel={
          studyPausedGames.length > 0 ? (
            <PausedGamesPanel
              games={studyPausedGames}
              catalog={catalog}
              onContinue={(gameId) => {
                void navigate(`/study/${gameId}`, {
                  state: { mode: 'resume' },
                });
              }}
              onAbandon={(gameId) => abandonGame(gameId)}
              isAbandoning={isAbandoning}
            />
          ) : undefined
        }
        onModuleChange={(module) => {
          setSelectedModule(module);
          setSelectedSubcategory(null);
        }}
        onSubcategoryChange={setSelectedSubcategory}
        onCountChange={setSelectedCount}
        onStart={handleStart}
      />
    </>
  );
};
