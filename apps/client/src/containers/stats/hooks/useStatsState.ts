import {
  useModuleProgress,
  useSubcategoryProgress,
  useWeakestFlashcards,
  useProgressSummary,
} from '../api';

interface UseStatsStateOptions {
  enabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStatsState(options?: UseStatsStateOptions) {
  const enabled = options?.enabled ?? true;

  const moduleProgress = useModuleProgress(enabled);
  const subcategoryProgress = useSubcategoryProgress(enabled);
  const weakestFlashcards = useWeakestFlashcards(enabled);
  const progressSummary = useProgressSummary(enabled);

  const queries = enabled
    ? [moduleProgress, subcategoryProgress, weakestFlashcards, progressSummary]
    : [];

  return {
    moduleProgress,
    subcategoryProgress,
    weakestFlashcards,
    progressSummary,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
