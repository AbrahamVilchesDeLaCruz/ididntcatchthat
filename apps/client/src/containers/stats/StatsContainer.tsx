import { type ReactElement, useState } from 'react';
import { useStatsState } from './hooks';
import { StatsComponent } from './StatsComponent';

export const StatsContainer = (): ReactElement => {
  const {
    moduleProgress,
    subcategoryProgress,
    weakestFlashcards,
    isLoading,
    isError,
  } = useStatsState();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-brand)] border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-[var(--color-accent-red)] text-center py-16">
        Error al cargar el progreso. Intentalo de nuevo.
      </div>
    );
  }

  return (
    <StatsComponent
      modules={moduleProgress.data ?? []}
      subcategories={subcategoryProgress.data ?? []}
      weakFlashcards={weakestFlashcards.data ?? []}
      selectedCategory={selectedCategory}
      onCategorySelect={setSelectedCategory}
      onCategoryClear={() => setSelectedCategory(null)}
    />
  );
};
