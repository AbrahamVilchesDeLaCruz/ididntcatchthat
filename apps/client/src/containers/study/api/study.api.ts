import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import type { ApiEnvelope } from '@/core/api/api-envelope';
import { achievementKeys } from '@/core/achievements/achievementKeys';
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
import { useProgressOptimisticStore } from '@/core/progress/progressOptimistic.store';
import { reconcileProgressWithBackoff } from '@/core/progress/reconcileProgress';
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

const invalidateStudyQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
): void => {
  void queryClient.invalidateQueries({ queryKey: gameKeys.paused });
  void queryClient.invalidateQueries({ queryKey: statsKeys.all });
  void queryClient.invalidateQueries({ queryKey: statsKeys.summary });
  void queryClient.invalidateQueries({ queryKey: achievementKeys.all });
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
      const res = await apiClient.post<ApiEnvelope<StartGameApiResponse>>(
        '/games',
        payload,
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      useProgressOptimisticStore.getState().beginStudySession({
        module: variables.module ?? null,
        cardCount: variables.cardCount,
      });
      invalidateStudyQueries(queryClient);
    },
  });
};

export const useRecordView = (
  sessionId: string,
): UseMutationResult<void, Error, RecordViewPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RecordViewPayload): Promise<void> => {
      await apiClient.post(`/games/${sessionId}/views`, payload);
    },
    onSuccess: (_data, variables) => {
      useProgressOptimisticStore
        .getState()
        .recordStudyView(variables.flashcardId);
      void queryClient.invalidateQueries({ queryKey: statsKeys.modules });
      void queryClient.invalidateQueries({ queryKey: statsKeys.summary });
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
      const res = await apiClient.post<ApiEnvelope<GameSummaryApiModel>>(
        `/games/${sessionId}/complete`,
      );
      const mapped = mapGameSummary(res.data.data);
      return {
        cardsViewed: mapped.cardsViewed,
        totalCount: mapped.totalCount,
        duration: mapped.duration,
      };
    },
    onSuccess: () => {
      useProgressOptimisticStore.getState().recordStudyComplete();
      invalidateStudyQueries(queryClient);
      void reconcileProgressWithBackoff(queryClient);
    },
  });
};

export const useCompleteGameStudy = useCompleteGame;
