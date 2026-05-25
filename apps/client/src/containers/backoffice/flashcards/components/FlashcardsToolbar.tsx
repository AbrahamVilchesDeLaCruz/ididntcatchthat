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

interface FlashcardsToolbarProps {
  categoryFilter: string | undefined;
  onCategoryFilter: (category: string | undefined) => void;
}

export const FlashcardsToolbar = ({
  categoryFilter,
  onCategoryFilter,
}: FlashcardsToolbarProps): ReactElement => {
  return (
    <div className="flex items-center gap-4">
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

      {categoryFilter && (
        <button
          type="button"
          onClick={() => onCategoryFilter(undefined)}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};
