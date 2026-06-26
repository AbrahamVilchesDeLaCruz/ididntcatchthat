import {
  useModuleProgress,
  useSubcategoryProgress,
  useWeakestFlashcards,
} from '../api';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStatsState() {
  const moduleProgress = useModuleProgress();
  const subcategoryProgress = useSubcategoryProgress();
  const weakestFlashcards = useWeakestFlashcards();

  return {
    moduleProgress,
    subcategoryProgress,
    weakestFlashcards,
    isLoading:
      moduleProgress.isLoading ||
      subcategoryProgress.isLoading ||
      weakestFlashcards.isLoading,
    isError:
      moduleProgress.isError ||
      subcategoryProgress.isError ||
      weakestFlashcards.isError,
  };
}
