import {
  useModuleProgress,
  useSubcategoryProgress,
  useWeakestFlashcards,
  useProgressSummary,
  useAchievements,
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
  const achievements = useAchievements(undefined, enabled);

  const queries = enabled
    ? [
        moduleProgress,
        subcategoryProgress,
        weakestFlashcards,
        progressSummary,
        achievements,
      ]
    : [];

  return {
    moduleProgress,
    subcategoryProgress,
    weakestFlashcards,
    progressSummary,
    achievements,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
