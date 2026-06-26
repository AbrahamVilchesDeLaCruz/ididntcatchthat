import { type ReactElement } from 'react';
import type { FlashcardCatalogApiModel } from '../api/flashcards.api-model';

const AUDIO_STATUSES = ['pending', 'generating', 'ready', 'failed'] as const;
type AudioStatus = (typeof AUDIO_STATUSES)[number];

const AUDIO_STATUS_LABELS: Record<AudioStatus, string> = {
  pending: 'Pendiente',
  generating: 'Generando',
  ready: 'Listo',
  failed: 'Fallido',
};

const selectClass =
  'px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed';

interface FlashcardsToolbarProps {
  catalog: FlashcardCatalogApiModel | undefined;
  categoryFilter: string | undefined;
  subcategoryFilter: string | undefined;
  audioStatusFilter: string | undefined;
  onCategoryFilter: (category: string | undefined) => void;
  onSubcategoryFilter: (subcategory: string | undefined) => void;
  onAudioStatusFilter: (audioStatus: string | undefined) => void;
}

export const FlashcardsToolbar = ({
  catalog,
  categoryFilter,
  subcategoryFilter,
  audioStatusFilter,
  onCategoryFilter,
  onSubcategoryFilter,
  onAudioStatusFilter,
}: FlashcardsToolbarProps): ReactElement => {
  const subcategories =
    catalog?.categories.find((c) => c.value === categoryFilter)
      ?.subcategories ?? [];

  const hasActiveFilters = !!(
    categoryFilter ??
    subcategoryFilter ??
    audioStatusFilter
  );

  const handleCategoryChange = (value: string): void => {
    onCategoryFilter(value || undefined);
    onSubcategoryFilter(undefined);
  };

  const handleClearFilters = (): void => {
    onCategoryFilter(undefined);
    onSubcategoryFilter(undefined);
    onAudioStatusFilter(undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Category */}
      <div>
        <label htmlFor="category-filter" className="sr-only">
          Filtrar por categoría
        </label>
        <select
          id="category-filter"
          value={categoryFilter ?? ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {catalog?.categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label.es}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory */}
      <div>
        <label htmlFor="subcategory-filter" className="sr-only">
          Filtrar por subcategoría
        </label>
        <select
          id="subcategory-filter"
          value={subcategoryFilter ?? ''}
          disabled={!categoryFilter}
          onChange={(e) => onSubcategoryFilter(e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">
            {categoryFilter
              ? 'Todas las subcategorías'
              : 'Elegí categoría primero'}
          </option>
          {subcategories.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label.es}
            </option>
          ))}
        </select>
      </div>

      {/* Audio status */}
      <div>
        <label htmlFor="audio-status-filter" className="sr-only">
          Filtrar por estado de audio
        </label>
        <select
          id="audio-status-filter"
          value={audioStatusFilter ?? ''}
          onChange={(e) => onAudioStatusFilter(e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">Todos los estados</option>
          {AUDIO_STATUSES.map((status) => (
            <option key={status} value={status}>
              {AUDIO_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};
