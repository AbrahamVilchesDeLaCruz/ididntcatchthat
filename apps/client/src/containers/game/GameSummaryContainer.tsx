import { type ReactElement, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { GameSummaryComponent } from './GameSummaryComponent';
import {
  clearGameSummary,
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
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const isGuest = isAuthenticated && guestDeviceId !== null;
  const state = (location.state as LocationState | null) ?? {};

  const summary: GameSummaryVM = resolveGameSummary(gameId, state.summary);

  useEffect(() => {
    if (gameId && state.summary) {
      saveGameSummary(gameId, state.summary);
    }
  }, [gameId, state.summary]);

  const handlePlayAgain = (): void => {
    if (gameId) clearGameSummary(gameId);
    void navigate('/game');
  };

  const handleViewStats = (): void => {
    void navigate('/stats');
  };

  const handleRegister = (): void => {
    void navigate('/auth/register');
  };

  return (
    <GameSummaryComponent
      summary={summary}
      isGuest={isGuest}
      onPlayAgain={handlePlayAgain}
      onViewStats={handleViewStats}
      onRegister={handleRegister}
    />
  );
};
