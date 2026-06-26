import { type ReactElement } from 'react';
import { ModuleProgressChart } from './components/ModuleProgressChart';
import { SubcategoryProgressPanel } from './components/SubcategoryProgressPanel';
import { WeakFlashcardsTable } from './components/WeakFlashcardsTable';
import type {
  ModuleProgressVM,
  SubcategoryProgressVM,
  WeakFlashcardVM,
} from './stats.types';

interface StatsComponentProps {
  modules: ModuleProgressVM[];
  subcategories: SubcategoryProgressVM[];
  weakFlashcards: WeakFlashcardVM[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  onCategoryClear: () => void;
}

export const StatsComponent = ({
  modules,
  subcategories,
  weakFlashcards,
  selectedCategory,
  onCategorySelect,
  onCategoryClear,
}: StatsComponentProps): ReactElement => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Mi progreso
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Resumen de tu avance por módulo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
          {selectedCategory === null ? (
            <>
              <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
                Precisión por módulo
              </h2>
              {modules.length === 0 ? (
                <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
                  Sin datos de módulos aún
                </p>
              ) : (
                <ModuleProgressChart
                  data={modules}
                  onCategoryClick={onCategorySelect}
                />
              )}
            </>
          ) : (
            <SubcategoryProgressPanel
              category={selectedCategory}
              data={subcategories}
              onBack={onCategoryClear}
            />
          )}
        </div>

        <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Flashcards más difíciles
          </h2>
          <WeakFlashcardsTable data={weakFlashcards} />
        </div>
      </div>
    </div>
  );
};
