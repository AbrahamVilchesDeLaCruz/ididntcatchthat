import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import {
  mapFlashcardForGame,
  mapGameSummary,
  mapResumeGame,
} from '../game.mapper';
import type {
  FlashcardGameApiModel,
  GameSummaryApiModel,
  PatchGamePayload,
  RecordAttemptPayload,
  ResumeGameApiResponse,
  StartGameApiResponse,
  StartGamePayload,
} from './game.api-model';
import type {
  FlashcardGameVM,
  GameSummaryVM,
  ResumeGameVM,
} from '../game.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const gameKeys = {
  all: ['game'] as const,
  flashcards: (gameId: string) =>
    [...gameKeys.all, 'flashcards', gameId] as const,
  resume: (gameId: string) => [...gameKeys.all, 'resume', gameId] as const,
  summary: (gameId: string) => [...gameKeys.all, 'summary', gameId] as const,
};

// ─── Start game ───────────────────────────────────────────────────────────────
export const useStartGame = (): UseMutationResult<
  StartGameApiResponse,
  Error,
  StartGamePayload
> => {
  return useMutation({
    mutationFn: async (
      payload: StartGamePayload,
    ): Promise<StartGameApiResponse> => {
      const res = await apiClient.post<StartGameApiResponse>('/games', payload);
      return res.data;
    },
  });
};

// ─── Record attempt (fire & forget — caller ignores result) ──────────────────
export const useRecordAttempt = (
  gameId: string,
): UseMutationResult<void, Error, RecordAttemptPayload> => {
  return useMutation({
    mutationFn: async (payload: RecordAttemptPayload): Promise<void> => {
      await apiClient.post(`/games/${gameId}/attempts`, payload);
    },
  });
};

// ─── Complete game ────────────────────────────────────────────────────────────
export const useCompleteGame = (): UseMutationResult<
  GameSummaryVM,
  Error,
  string
> => {
  return useMutation({
    mutationFn: async (gameId: string): Promise<GameSummaryVM> => {
      const res = await apiClient.post<GameSummaryApiModel>(
        `/games/${gameId}/complete`,
      );
      return mapGameSummary(res.data);
    },
  });
};

// ─── Fetch game summary (recovery when navigation state is missing) ─────────────
export const useGameSummary = (
  gameId: string,
  enabled: boolean,
): UseQueryResult<GameSummaryVM> => {
  return useQuery({
    queryKey: gameKeys.summary(gameId),
    queryFn: async (): Promise<GameSummaryVM> => {
      const res = await apiClient.get<GameSummaryApiModel>(
        `/games/${gameId}/summary`,
      );
      return mapGameSummary(res.data);
    },
    enabled: !!gameId && enabled,
    retry: 1,
  });
};

// ─── Patch game (pause / abandon) ────────────────────────────────────────────
export const usePatchGame = (): UseMutationResult<
  void,
  Error,
  { gameId: string; payload: PatchGamePayload }
> => {
  return useMutation({
    mutationFn: async ({
      gameId,
      payload,
    }: {
      gameId: string;
      payload: PatchGamePayload;
    }): Promise<void> => {
      await apiClient.patch(`/games/${gameId}`, payload);
    },
  });
};

// ─── Fetch all flashcards for a game (loaded once at game start) ──────────────
export const useGameFlashcards = (
  gameId: string,
): UseQueryResult<FlashcardGameVM[]> => {
  return useQuery({
    queryKey: gameKeys.flashcards(gameId),
    queryFn: async (): Promise<FlashcardGameVM[]> => {
      const res = await apiClient.get<FlashcardGameApiModel[]>(
        `/games/${gameId}/flashcards`,
      );
      return res.data.map(mapFlashcardForGame);
    },
    enabled: !!gameId,
    staleTime: Infinity, // flashcard content never changes mid-game
  });
};

// ─── Resume game ──────────────────────────────────────────────────────────────
export const useResumeGame = (gameId: string): UseQueryResult<ResumeGameVM> => {
  return useQuery({
    queryKey: gameKeys.resume(gameId),
    queryFn: async (): Promise<ResumeGameApiResponse> => {
      const res = await apiClient.get<ResumeGameApiResponse>(
        `/games/${gameId}/resume`,
      );
      return res.data;
    },
    select: mapResumeGame,
    enabled: !!gameId,
  });
};
