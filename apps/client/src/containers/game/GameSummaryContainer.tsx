import { type ReactElement, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useGameSummary, usePausedGames, useStartGame } from './api/game.api';
import { GameSummaryComponent } from './GameSummaryComponent';
import {
  clearGameSummary,
  readGameSummary,
  resolveGameSummary,
  saveGameSummary,
} from './game-summary.storage';
import type { GameSummaryVM } from './game.types';

interface LocationState {
  summary?: GameSummaryVM;
}

export const GameSummaryContainer = (): ReactElement => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userType = useAuthStore((s) => s.userType);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const isGuest = isAuthenticated && guestDeviceId !== null;
  const canSeePaused = userType !== null && userType !== 'guest';
  const state = (location.state as LocationState | null) ?? {};

  const hasNavigationSummary = state.summary !== undefined;
  const storedSummary = gameId ? readGameSummary(gameId) : null;
  const hasStoredSummary =
    storedSummary !== null && storedSummary.totalCount > 0;

  const shouldFetch = !!gameId && !hasNavigationSummary && !hasStoredSummary;

  const {
    data: fetchedSummary,
    isLoading,
    isError,
  } = useGameSummary(gameId ?? '', shouldFetch);

  const { data: pausedGames = [] } = usePausedGames(canSeePaused);
  const { mutate: startGame } = useStartGame();

  useEffect(() => {
    if (gameId && state.summary) {
      saveGameSummary(gameId, state.summary);
    }
  }, [gameId, state.summary]);

  const summary: GameSummaryVM | null = hasNavigationSummary
    ? state.summary!
    : hasStoredSummary
      ? storedSummary
      : (fetchedSummary ?? null);

  const handleChooseModule = (): void => {
    if (gameId) clearGameSummary(gameId);
    void navigate('/game');
  };

  const handlePlayAgain = (): void => {
    if (gameId) clearGameSummary(gameId);
    startGame(
      { mode: 'game', module: null, cardCount: 10 },
      {
        onSuccess: ({ gameId: newGameId, flashcardIds }) => {
          void navigate(`/game/${newGameId}`, { state: { flashcardIds } });
        },
        onError: () => {
          void navigate('/game');
        },
      },
    );
  };

  const handleViewPaused = (): void => {
    void navigate('/game');
  };

  const handleViewStats = (): void => {
    void navigate('/stats');
  };

  const handleViewAchievements = (): void => {
    void navigate('/profile#achievements');
  };

  const handleRegister = (): void => {
    void navigate('/auth/register');
  };

  const handlePracticeWeakest = (): void => {
    startGame(
      { mode: 'game', module: null, cardCount: 10, source: 'weakest' },
      {
        onSuccess: ({ gameId, flashcardIds }) => {
          void navigate(`/game/${gameId}`, { state: { flashcardIds } });
        },
      },
    );
  };

  if (shouldFetch && isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  if (shouldFetch && (isError || !summary)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-bg-base)] px-5">
        <p className="text-[var(--color-accent-red)]">
          No se pudo cargar el resumen de la partida.
        </p>
        <button
          type="button"
          onClick={handlePlayAgain}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white"
        >
          Volver a jugar
        </button>
      </div>
    );
  }

  return (
    <GameSummaryComponent
      summary={summary ?? resolveGameSummary(gameId, undefined)}
      isGuest={isGuest}
      pausedGamesCount={canSeePaused ? pausedGames.length : 0}
      onPlayAgain={handlePlayAgain}
      onChooseModule={handleChooseModule}
      onViewPaused={handleViewPaused}
      onViewStats={handleViewStats}
      onViewAchievements={isGuest ? undefined : handleViewAchievements}
      onRegister={handleRegister}
      onPracticeWeakest={isGuest ? undefined : handlePracticeWeakest}
    />
  );
};
