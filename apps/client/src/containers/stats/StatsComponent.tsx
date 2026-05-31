import { type ReactElement } from 'react';
import { ModuleProgressChart } from './components/ModuleProgressChart';
import { WeakFlashcardsTable } from './components/WeakFlashcardsTable';
import type { ModuleProgressVM, WeakFlashcardVM } from './stats.types';

interface StatsComponentProps {
  modules: ModuleProgressVM[];
  weakFlashcards: WeakFlashcardVM[];
}

export const StatsComponent = ({
  modules,
  weakFlashcards,
}: StatsComponentProps): ReactElement => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Mi progreso
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm mt-1">
          Resumen de tu avance por módulo
        </p>
      </div>

      {/* Grid: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precisión por módulo */}
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Precisión por módulo
          </h2>
          {modules.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-sm text-center py-16">
              Sin datos de módulos aún
            </p>
          ) : (
            <ModuleProgressChart data={modules} />
          )}
        </div>

        {/* Flashcards más débiles */}
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
