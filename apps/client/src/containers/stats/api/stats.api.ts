import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import {
  mergeModuleProgressWithOptimistic,
  mergeProgressSummaryWithOptimistic,
  selectProgressOptimistic,
  useProgressOptimisticStore,
} from '@/core/progress/progressOptimistic.store';
import {
  mapModuleProgress,
  mapSubcategoryProgress,
  mapWeakFlashcard,
  mapProgressSummary,
} from '../stats.mapper';
import type {
  ModuleProgressApiModel,
  SubcategoryProgressApiModel,
  WeakFlashcardApiModel,
  ProgressSummaryApiModel,
} from './stats.api-model';
import type {
  ModuleProgressVM,
  SubcategoryProgressVM,
  WeakFlashcardVM,
  ProgressSummaryVM,
} from '../stats.types';

export const statsKeys = {
  all: ['stats'] as const,
  modules: ['stats', 'modules'] as const,
  weakest: ['stats', 'weakest'] as const,
  subcategories: ['stats', 'subcategories'] as const,
  summary: ['stats', 'summary'] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useModuleProgress = (enabled = true) => {
  const optimistic = useProgressOptimisticStore(selectProgressOptimistic);
  const query = useQuery({
    queryKey: statsKeys.modules,
    enabled,
    queryFn: async (): Promise<ModuleProgressVM[]> => {
      const res = await apiClient.get<{ data: ModuleProgressApiModel[] }>(
        '/progress/modules',
      );
      return res.data.data.map(mapModuleProgress);
    },
  });

  return {
    ...query,
    data: query.data
      ? mergeModuleProgressWithOptimistic(query.data, optimistic)
      : undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useWeakestFlashcards = (enabled = true) => {
  return useQuery({
    queryKey: statsKeys.weakest,
    enabled,
    queryFn: async (): Promise<WeakFlashcardVM[]> => {
      const res = await apiClient.get<{ data: WeakFlashcardApiModel[] }>(
        '/progress/flashcards/weakest',
      );
      return res.data.data.map(mapWeakFlashcard);
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useSubcategoryProgress = (enabled = true) => {
  return useQuery({
    queryKey: statsKeys.subcategories,
    enabled,
    queryFn: async (): Promise<SubcategoryProgressVM[]> => {
      const res = await apiClient.get<{ data: SubcategoryProgressApiModel[] }>(
        '/progress/subcategories',
      );
      return res.data.data.map(mapSubcategoryProgress);
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useProgressSummary = (enabled = true) => {
  const optimistic = useProgressOptimisticStore(selectProgressOptimistic);
  const query = useQuery({
    queryKey: statsKeys.summary,
    enabled,
    queryFn: async (): Promise<ProgressSummaryVM> => {
      const res = await apiClient.get<{ data: ProgressSummaryApiModel }>(
        '/progress/summary',
      );
      return mapProgressSummary(res.data.data);
    },
  });

  return {
    ...query,
    data: query.data
      ? mergeProgressSummaryWithOptimistic(query.data, optimistic)
      : undefined,
  };
};
