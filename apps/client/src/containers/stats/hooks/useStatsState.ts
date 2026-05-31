import { useModuleProgress, useWeakestFlashcards } from '../api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStatsState() {
  const moduleProgress = useModuleProgress();
  const weakestFlashcards = useWeakestFlashcards();

  return {
    moduleProgress,
    weakestFlashcards,
    isLoading: moduleProgress.isLoading || weakestFlashcards.isLoading,
    isError: moduleProgress.isError || weakestFlashcards.isError,
  };
}
