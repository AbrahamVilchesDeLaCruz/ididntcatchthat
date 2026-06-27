import { type ReactElement, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { isMaxPausedGamesError } from '@/core/api/apiError';
import { useFlashcardCatalog } from '@/core/api/flashcard-catalog.api';
import { useAbandonGame, usePausedGames, useStartGame } from './api/game.api';
import { useGuestAuth } from '@/containers/auth/api/auth.api';
import { GameConfigComponent } from './GameConfigComponent';
import { MaxPausedGamesModal } from './components/MaxPausedGamesModal';
import { PausedGamesPanel } from './components/PausedGamesPanel';
import type { GameModule, StartGamePayload } from './api/game.api-model';

export type CardCount = 10 | 20 | 50;

interface LocationState {
  prefillModule?: GameModule;
  prefillSubcategory?: string | null;
  pausedSaved?: boolean;
}

export const GameConfigContainer = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as LocationState | null) ?? {};

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userType = useAuthStore((s) => s.userType);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setGuestDeviceId = useAuthStore((s) => s.setGuestDeviceId);

  const isGuest = userType === 'guest';
  const canPause = userType !== null && userType !== 'guest';

  const { data: catalog } = useFlashcardCatalog();
  const { mutate: startGame, isPending: isStarting } = useStartGame();
  const { mutate: guestAuth, isPending: isAuthenticating } = useGuestAuth();
  const { data: pausedGames = [] } = usePausedGames(canPause);
  const { mutate: abandonGame, isPending: isAbandoning } = useAbandonGame();

  const [selectedModule, setSelectedModule] = useState<GameModule>(
    navState.prefillModule ?? 'random',
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    navState.prefillSubcategory ?? null,
  );
  const [selectedCount, setSelectedCount] = useState<CardCount>(10);
  const [guestError, setGuestError] = useState(false);
  const [showMaxPausedModal, setShowMaxPausedModal] = useState(false);
  const [pendingStartPayload, setPendingStartPayload] =
    useState<StartGamePayload | null>(null);
  const [showPausedSavedBanner] = useState(() => navState.pausedSaved === true);

  const isPending = isStarting || isAuthenticating;

  useEffect(() => {
    if (navState.pausedSaved) {
      void navigate('/game', { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      guestAuth(
        { guestDeviceId: guestDeviceId ?? undefined },
        {
          onSuccess: ({ accessToken, deviceId }) => {
            setAccessToken(accessToken);
            setGuestDeviceId(deviceId);
            startGame(
              { mode: 'game', module: null, subcategory: null, cardCount: 10 },
              {
                onSuccess: ({ gameId, flashcardIds }) => {
                  void navigate(`/game/${gameId}`, {
                    replace: true,
                    state: { flashcardIds },
                  });
                },
                onError: () => setGuestError(true),
              },
            );
          },
          onError: () => setGuestError(true),
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModuleChange = (module: GameModule): void => {
    setSelectedModule(module);
    setSelectedSubcategory(null);
  };

  const launchGame = (payload: StartGamePayload): void => {
    startGame(payload, {
      onSuccess: ({ gameId, flashcardIds }) => {
        setShowMaxPausedModal(false);
        setPendingStartPayload(null);
        void navigate(`/game/${gameId}`, { state: { flashcardIds } });
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
    launchGame({
      mode: 'game',
      module,
      subcategory: module === null ? null : selectedSubcategory,
      cardCount: selectedCount,
    });
  };

  const handleContinuePaused = (gameId: string): void => {
    void navigate(`/game/${gameId}`, { state: { mode: 'resume' } });
  };

  const handleAbandonPaused = (gameId: string): void => {
    abandonGame(gameId, {
      onSuccess: () => {
        if (pendingStartPayload) {
          launchGame(pendingStartPayload);
        }
      },
    });
  };

  const handleGuestRetry = (): void => {
    setGuestError(false);
    guestAuth(
      { guestDeviceId: guestDeviceId ?? undefined },
      {
        onSuccess: ({ accessToken, deviceId }) => {
          setAccessToken(accessToken);
          setGuestDeviceId(deviceId);
          startGame(
            { mode: 'game', module: null, subcategory: null, cardCount: 10 },
            {
              onSuccess: ({ gameId, flashcardIds }) => {
                void navigate(`/game/${gameId}`, {
                  replace: true,
                  state: { flashcardIds },
                });
              },
              onError: () => setGuestError(true),
            },
          );
        },
        onError: () => setGuestError(true),
      },
    );
  };

  if (!isAuthenticated) {
    if (guestError) {
      return (
        <GameConfigComponent
          selectedModule="random"
          selectedSubcategory={null}
          selectedCount={10}
          catalog={catalog}
          isPending={false}
          guestError
          pausedSavedBanner={false}
          onGuestRetry={handleGuestRetry}
          onModuleChange={() => undefined}
          onSubcategoryChange={() => undefined}
          onCountChange={() => undefined}
          onStart={() => undefined}
        />
      );
    }

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
        selectedModule={selectedModule}
        selectedSubcategory={selectedSubcategory}
        selectedCount={selectedCount}
        catalog={catalog}
        isPending={isPending}
        guestError={false}
        pausedSavedBanner={showPausedSavedBanner && !isGuest}
        pausedGamesPanel={
          canPause && pausedGames.length > 0 ? (
            <PausedGamesPanel
              games={pausedGames}
              catalog={catalog}
              onContinue={handleContinuePaused}
              onAbandon={(gameId) => abandonGame(gameId)}
              isAbandoning={isAbandoning}
            />
          ) : undefined
        }
        onModuleChange={handleModuleChange}
        onSubcategoryChange={setSelectedSubcategory}
        onCountChange={setSelectedCount}
        onStart={handleStart}
      />
    </>
  );
};
