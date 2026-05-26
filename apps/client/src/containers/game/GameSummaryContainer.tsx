import { type ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { GameSummaryComponent } from './GameSummaryComponent';
import type { GameSummaryVM } from './game.types';

interface LocationState {
  summary?: GameSummaryVM;
}

export const GameSummaryContainer = (): ReactElement => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const isGuest = isAuthenticated && guestDeviceId !== null;
  const state = (location.state as LocationState | null) ?? {};

  const summary: GameSummaryVM = state.summary ?? {
    correctCount: 0,
    totalCount: 0,
    accuracy: 0,
    duration: 0,
  };

  const handlePlayAgain = (): void => {
    void navigate('/game');
  };

  const handleRegister = (): void => {
    void navigate('/auth/register');
  };

  return (
    <GameSummaryComponent
      summary={summary}
      isGuest={isGuest}
      onPlayAgain={handlePlayAgain}
      onRegister={handleRegister}
    />
  );
};
