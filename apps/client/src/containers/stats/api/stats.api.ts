import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';
import { apiClient } from '@/core/api/apiClient';
import {
  type PaginatedApiEnvelope,
  type PaginationMeta,
} from '@/core/api/api-envelope';
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
  WeakFlashcardVM,
  ProgressSummaryVM,
} from '../stats.types';

export const statsKeys = {
  all: ['stats'] as const,
  modules: ['stats', 'modules'] as const,
  weakest: ['stats', 'weakest'] as const,
  // page-aware key: cada página se cachea por separado. Si el usuario
  // vuelve a una página ya vista, no se hace fetch.
  weakestPage: (page: number, pageSize: number) =>
    ['stats', 'weakest', page, pageSize] as const,
  subcategories: ['stats', 'subcategories'] as const,
  summary: ['stats', 'summary'] as const,
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useModuleProgress = (enabled = true) => {
  const optimistic = useProgressOptimisticStore(
    useShallow(selectProgressOptimistic),
  );
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

  const data = useMemo(
    () =>
      query.data
        ? mergeModuleProgressWithOptimistic(query.data, optimistic)
        : undefined,
    [optimistic, query.data],
  );

  return {
    ...query,
    data,
  };
};

export interface WeakestFlashcardsPage {
  data: WeakFlashcardVM[];
  pagination: PaginationMeta;
}

export const useWeakestFlashcards = (options?: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
}): {
  data: WeakFlashcardVM[] | undefined;
  pagination: PaginationMeta | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} => {
  const enabled = options?.enabled ?? true;
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const query = useQuery({
    queryKey: statsKeys.weakestPage(page, pageSize),
    enabled,
    placeholderData: (previous) => previous,
    queryFn: async (): Promise<WeakestFlashcardsPage> => {
      const res = await apiClient.get<
        PaginatedApiEnvelope<WeakFlashcardApiModel>
      >('/progress/flashcards/weakest', {
        params: { page, pageSize },
      });
      return {
        data: res.data.data.map(mapWeakFlashcard),
        pagination: res.data.pagination,
      };
    },
  });

  const data = useMemo(() => query.data?.data, [query.data]);
  const pagination = useMemo(() => query.data?.pagination, [query.data]);

  return {
    ...query,
    data,
    pagination,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useSubcategoryProgress = (enabled = true) => {
  return useQuery({
    queryKey: statsKeys.subcategories,
    enabled,
    queryFn: async (): Promise<SubcategoryProgressApiModel[]> => {
      const res = await apiClient.get<{ data: SubcategoryProgressApiModel[] }>(
        '/progress/subcategories',
      );
      return res.data.data.map(mapSubcategoryProgress);
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useProgressSummary = (enabled = true) => {
  const optimistic = useProgressOptimisticStore(
    useShallow(selectProgressOptimistic),
  );
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

  const data = useMemo(
    () =>
      query.data
        ? mergeProgressSummaryWithOptimistic(query.data, optimistic)
        : undefined,
    [optimistic, query.data],
  );

  return {
    ...query,
    data,
  };
};
