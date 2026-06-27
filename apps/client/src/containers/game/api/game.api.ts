import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { statsKeys } from '@/containers/stats/api/stats.api';
import {
  mapFlashcardForGame,
  mapGameSummary,
  mapPausedGame,
  mapResumeGame,
} from '../game.mapper';
import type {
  FlashcardGameApiModel,
  GameSummaryApiModel,
  PausedGameApiModel,
  PatchGamePayload,
  RecordAttemptPayload,
  ResumeGameApiResponse,
  StartGameApiResponse,
  StartGamePayload,
} from './game.api-model';
import type {
  FlashcardGameVM,
  GameSummaryVM,
  PausedGameVM,
  ResumeGameVM,
} from '../game.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const gameKeys = {
  all: ['game'] as const,
  paused: ['game', 'paused'] as const,
  flashcards: (gameId: string) =>
    [...gameKeys.all, 'flashcards', gameId] as const,
  resume: (gameId: string) => [...gameKeys.all, 'resume', gameId] as const,
  summary: (gameId: string) => [...gameKeys.all, 'summary', gameId] as const,
};

const invalidateGameAndStats = (
  queryClient: ReturnType<typeof useQueryClient>,
): void => {
  void queryClient.invalidateQueries({ queryKey: gameKeys.paused });
  void queryClient.invalidateQueries({ queryKey: statsKeys.all });
  void queryClient.invalidateQueries({ queryKey: statsKeys.summary });
  void queryClient.invalidateQueries({ queryKey: statsKeys.achievements });
};

// ─── Start game ───────────────────────────────────────────────────────────────
export const useStartGame = (): UseMutationResult<
  StartGameApiResponse,
  Error,
  StartGamePayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: StartGamePayload,
    ): Promise<StartGameApiResponse> => {
      const res = await apiClient.post<StartGameApiResponse>('/games', payload);
      return res.data;
    },
    onSuccess: () => {
      invalidateGameAndStats(queryClient);
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string): Promise<GameSummaryVM> => {
      const res = await apiClient.post<GameSummaryApiModel>(
        `/games/${gameId}/complete`,
      );
      return mapGameSummary(res.data);
    },
    onSuccess: () => {
      invalidateGameAndStats(queryClient);
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
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      invalidateGameAndStats(queryClient);
    },
  });
};

// ─── Abandon paused game ──────────────────────────────────────────────────────
export const useAbandonGame = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string): Promise<void> => {
      await apiClient.patch(`/games/${gameId}`, { status: 'abandoned' });
    },
    onSuccess: () => {
      invalidateGameAndStats(queryClient);
    },
  });
};

// ─── List paused games ────────────────────────────────────────────────────────
export const usePausedGames = (
  enabled = true,
): UseQueryResult<PausedGameVM[]> => {
  return useQuery({
    queryKey: gameKeys.paused,
    queryFn: async (): Promise<PausedGameVM[]> => {
      const res = await apiClient.get<PausedGameApiModel[]>('/games');
      return res.data.map(mapPausedGame);
    },
    enabled,
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
    staleTime: Infinity,
  });
};

// ─── Resume game ──────────────────────────────────────────────────────────────
export const useResumeGame = (
  gameId: string,
  enabled = true,
): UseQueryResult<ResumeGameVM> => {
  return useQuery({
    queryKey: gameKeys.resume(gameId),
    queryFn: async (): Promise<ResumeGameApiResponse> => {
      const res = await apiClient.get<ResumeGameApiResponse>(
        `/games/${gameId}/resume`,
      );
      return res.data;
    },
    select: mapResumeGame,
    enabled: !!gameId && enabled,
    retry: false,
  });
};
