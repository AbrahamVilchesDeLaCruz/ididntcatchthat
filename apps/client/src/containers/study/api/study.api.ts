import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { statsKeys } from '@/containers/stats/api/stats.api';
import {
  gameKeys,
  useCompleteGame,
  usePatchGame,
  usePausedGames,
  useResumeGame,
  useGameFlashcards,
} from '@/containers/game/api/game.api';
import { mapGameSummary } from '@/containers/game/game.mapper';
import type {
  GameSummaryApiModel,
  StartGameApiResponse,
} from '@/containers/game/api/game.api-model';
import type {
  RecordViewPayload,
  StartStudyPayload,
  StudySummaryVM,
} from '../study.types';

export { usePatchGame, usePausedGames, useResumeGame, useGameFlashcards };

export const studyKeys = {
  all: ['study'] as const,
};

const invalidateStudyAndStats = (
  queryClient: ReturnType<typeof useQueryClient>,
): void => {
  void queryClient.invalidateQueries({ queryKey: gameKeys.paused });
  void queryClient.invalidateQueries({ queryKey: statsKeys.all });
  void queryClient.invalidateQueries({ queryKey: statsKeys.summary });
};

export const useCreateStudySession = (): UseMutationResult<
  StartGameApiResponse,
  Error,
  StartStudyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: StartStudyPayload,
    ): Promise<StartGameApiResponse> => {
      const res = await apiClient.post<StartGameApiResponse>('/games', payload);
      return res.data;
    },
    onSuccess: () => {
      invalidateStudyAndStats(queryClient);
    },
  });
};

export const useRecordView = (
  sessionId: string,
): UseMutationResult<void, Error, RecordViewPayload> => {
  return useMutation({
    mutationFn: async (payload: RecordViewPayload): Promise<void> => {
      await apiClient.post(`/games/${sessionId}/views`, payload);
    },
  });
};

export const useCompleteStudy = (): UseMutationResult<
  StudySummaryVM,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<StudySummaryVM> => {
      const res = await apiClient.post<GameSummaryApiModel>(
        `/games/${sessionId}/complete`,
      );
      const mapped = mapGameSummary(res.data);
      return {
        cardsViewed: mapped.cardsViewed,
        totalCount: mapped.totalCount,
        duration: mapped.duration,
      };
    },
    onSuccess: () => {
      invalidateStudyAndStats(queryClient);
    },
  });
};

export const useCompleteGameStudy = useCompleteGame;
