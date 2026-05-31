import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapModuleProgress, mapWeakFlashcard } from '../stats.mapper';
import type {
  ModuleProgressApiModel,
  WeakFlashcardApiModel,
} from './stats.api-model';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const statsKeys = {
  modules: ['stats', 'modules'] as const,
  weakest: ['stats', 'weakest'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useModuleProgress = () => {
  return useQuery({
    queryKey: statsKeys.modules,
    queryFn: () =>
      apiClient
        .get<ModuleProgressApiModel[]>('/progress/modules')
        .then((res) => res.data),
    select: (data) => data.map(mapModuleProgress),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useWeakestFlashcards = () => {
  return useQuery({
    queryKey: statsKeys.weakest,
    queryFn: () =>
      apiClient
        .get<WeakFlashcardApiModel[]>('/progress/flashcards/weakest')
        .then((res) => res.data),
    select: (data) => data.map(mapWeakFlashcard),
  });
};
