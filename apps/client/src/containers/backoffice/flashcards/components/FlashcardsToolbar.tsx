import { type ReactElement } from 'react';

const CATEGORIES = [
  'connecting_words_in_speech',
  'contractions_weak_forms',
  'discourse_markers',
  'fillers_hesitation',
  'intonation_patterns',
  'linking_words',
  'phrasal_verbs',
  'reduced_forms',
  'sentence_stress',
];

const AUDIO_STATUSES = ['pending', 'generating', 'ready', 'failed'] as const;
type AudioStatus = (typeof AUDIO_STATUSES)[number];

const AUDIO_STATUS_LABELS: Record<AudioStatus, string> = {
  pending: 'Pendiente',
  generating: 'Generando',
  ready: 'Listo',
  failed: 'Fallido',
};

interface FlashcardsToolbarProps {
  categoryFilter: string | undefined;
  subcategoryFilter: string | undefined;
  audioStatusFilter: string | undefined;
  onCategoryFilter: (category: string | undefined) => void;
  onSubcategoryFilter: (subcategory: string | undefined) => void;
  onAudioStatusFilter: (audioStatus: string | undefined) => void;
}

export const FlashcardsToolbar = ({
  categoryFilter,
  subcategoryFilter,
  audioStatusFilter,
  onCategoryFilter,
  onSubcategoryFilter,
  onAudioStatusFilter,
}: FlashcardsToolbarProps): ReactElement => {
  const hasActiveFilters = !!(
    categoryFilter ??
    subcategoryFilter ??
    audioStatusFilter
  );

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
          onChange={(e) => onCategoryFilter(e.target.value || undefined)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory — free text */}
      <div>
        <label htmlFor="subcategory-filter" className="sr-only">
          Filtrar por subcategoría
        </label>
        <input
          id="subcategory-filter"
          type="text"
          placeholder="Subcategoría..."
          value={subcategoryFilter ?? ''}
          onChange={(e) => onSubcategoryFilter(e.target.value || undefined)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-gray-500"
        />
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
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
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
