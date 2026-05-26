import { type ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/store/auth.store';
import { useStartGame } from './api/game.api';
import { useGuestAuth } from '@/containers/auth/api/auth.api';
import { GameConfigComponent } from './GameConfigComponent';
import type { GameModule } from './api/game.api-model';

export type CardCount = 10 | 20 | 50;

export const GameConfigContainer = (): ReactElement => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestDeviceId = useAuthStore((s) => s.guestDeviceId);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setGuestDeviceId = useAuthStore((s) => s.setGuestDeviceId);

  const { mutate: startGame, isPending: isStarting } = useStartGame();
  const { mutate: guestAuth, isPending: isAuthenticating } = useGuestAuth();

  const [selectedModule, setSelectedModule] = useState<GameModule>('random');
  const [selectedCount, setSelectedCount] = useState<CardCount>(10);

  const isPending = isStarting || isAuthenticating;

  // Guest users: get a guest token then auto-start
  useEffect(() => {
    if (!isAuthenticated) {
      guestAuth(
        { guestDeviceId: guestDeviceId ?? undefined },
        {
          onSuccess: ({ accessToken, deviceId }) => {
            setAccessToken(accessToken);
            setGuestDeviceId(deviceId);
            startGame(
              { mode: 'game', module: null, cardCount: 10 },
              {
                onSuccess: ({ gameId, flashcardIds }) => {
                  void navigate(`/game/${gameId}`, {
                    replace: true,
                    state: { flashcardIds },
                  });
                },
              },
            );
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = (): void => {
    startGame(
      {
        mode: 'game',
        module: selectedModule === 'random' ? null : selectedModule,
        cardCount: selectedCount,
      },
      {
        onSuccess: ({ gameId, flashcardIds }) => {
          void navigate(`/game/${gameId}`, { state: { flashcardIds } });
        },
      },
    );
  };

  // While guest authenticates + auto-starts, show spinner
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--color-bg-base)]">
        <div className="size-8 animate-spin rounded-full border-2 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <GameConfigComponent
      selectedModule={selectedModule}
      selectedCount={selectedCount}
      isPending={isPending}
      onModuleChange={setSelectedModule}
      onCountChange={setSelectedCount}
      onStart={handleStart}
    />
  );
};
