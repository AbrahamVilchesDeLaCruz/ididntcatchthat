import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MigrateGuestPayload } from '@/containers/auth/api/auth.api-model';

export interface GuestGameRecord {
  gameId: string;
  flashcardId: string;
  score: number;
  durationMs: number;
  playedAt: string;
}

interface GuestStatsState {
  gamesPlayed: number;
  totalAttempts: number;
  correctAttempts: number;
  failedFlashcardIds: string[];
  gameRecords: GuestGameRecord[];
  recordGameComplete: (params: {
    gameId: string;
    correctCount: number;
    totalCount: number;
    durationMs: number;
    failedFlashcardIds: string[];
  }) => void;
  buildMigratePayload: (guestDeviceId: string) => MigrateGuestPayload;
  reset: () => void;
}

const initialState = {
  gamesPlayed: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  failedFlashcardIds: [] as string[],
  gameRecords: [] as GuestGameRecord[],
};

export const useGuestStatsStore = create<GuestStatsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      recordGameComplete: ({
        gameId,
        correctCount,
        totalCount,
        durationMs,
        failedFlashcardIds,
      }) => {
        const playedAt = new Date().toISOString();
        const records: GuestGameRecord[] = failedFlashcardIds.map(
          (flashcardId) => ({
            gameId,
            flashcardId,
            score: 0,
            durationMs,
            playedAt,
          }),
        );

        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
          totalAttempts: state.totalAttempts + totalCount,
          correctAttempts: state.correctAttempts + correctCount,
          failedFlashcardIds: [
            ...new Set([...state.failedFlashcardIds, ...failedFlashcardIds]),
          ],
          gameRecords: [...state.gameRecords, ...records],
        }));
      },
      buildMigratePayload: (guestDeviceId) => ({
        guestDeviceId,
        guestGames: get().gameRecords,
      }),
      reset: () => set(initialState),
    }),
    { name: 'guest-stats' },
  ),
);

export const guestSessionAccuracy = (state: GuestStatsState): number => {
  if (state.totalAttempts === 0) return 0;
  return Math.round((state.correctAttempts / state.totalAttempts) * 100);
};
