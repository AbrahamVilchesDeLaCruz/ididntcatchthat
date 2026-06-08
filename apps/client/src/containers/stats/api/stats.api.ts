import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/apiClient';
import { mapModuleProgress, mapWeakFlashcard } from '../stats.mapper';
import type {
  ModuleProgressApiModel,
  WeakFlashcardApiModel,
} from './stats.api-model';
import type { ModuleProgressVM, WeakFlashcardVM } from '../stats.types';

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
    queryFn: async (): Promise<ModuleProgressVM[]> => {
      const res = await apiClient.get<{ data: ModuleProgressApiModel[] }>(
        '/progress/modules',
      );
      return res.data.data.map(mapModuleProgress);
    },
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useWeakestFlashcards = () => {
  return useQuery({
    queryKey: statsKeys.weakest,
    queryFn: async (): Promise<WeakFlashcardVM[]> => {
      const res = await apiClient.get<{ data: WeakFlashcardApiModel[] }>(
        '/progress/flashcards/weakest',
      );
      return res.data.data.map(mapWeakFlashcard);
    },
  });
};
