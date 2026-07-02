import { type ReactElement, useState } from 'react';
import type { FlashcardCatalogApiModel } from '../api/flashcards.api-model';
import type {
  FlashcardExampleVM,
  FlashcardFormValues,
} from '../flashcards.types';

interface FlashcardFormModalProps {
  title: string;
  catalog: FlashcardCatalogApiModel | undefined;
  initialValues?: FlashcardFormValues;
  isLoading: boolean;
  onSubmit: (values: FlashcardFormValues) => void;
  onClose: () => void;
}

const DEFAULT_VALUES: FlashcardFormValues = {
  expression: '',
  meaning: '',
  category: '',
  subcategory: '',
  examples: [],
};

const selectClass =
  'w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)] disabled:opacity-40 disabled:cursor-not-allowed';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)]';

export const FlashcardFormModal = ({
  title,
  catalog,
  initialValues = DEFAULT_VALUES,
  isLoading,
  onSubmit,
  onClose,
}: FlashcardFormModalProps): ReactElement => {
  const [values, setValues] = useState<FlashcardFormValues>(initialValues);

  const setField = <K extends keyof FlashcardFormValues>(
    field: K,
    value: FlashcardFormValues[K],
  ): void => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string): void => {
    setValues((prev) => ({ ...prev, category, subcategory: '' }));
  };

  const subcategories =
    catalog?.categories.find((c) => c.value === values.category)
      ?.subcategories ?? [];

  const addExample = (): void => {
    const newExample: FlashcardExampleVM = {
      id: globalThis.crypto.randomUUID(),
      textEn: '',
      textEs: '',
      position: values.examples.length + 1,
    };
    setField('examples', [...values.examples, newExample]);
  };

  const updateExample = (
    idx: number,
    field: 'textEn' | 'textEs',
    value: string,
  ): void => {
    const updated = values.examples.map((ex, i) =>
      i === idx ? { ...ex, [field]: value } : ex,
    );
    setField('examples', updated);
  };

  const removeExample = (idx: number): void => {
    setField(
      'examples',
      values.examples
        .filter((_, i) => i !== idx)
        .map((ex, i) => ({ ...ex, position: i + 1 })),
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[var(--color-text-primary)] font-semibold text-lg">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Expresión + Significado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Expresión *
              </label>
              <input
                type="text"
                required
                value={values.expression}
                onChange={(e) => setField('expression', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Significado *
              </label>
              <input
                type="text"
                required
                value={values.meaning}
                onChange={(e) => setField('meaning', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Categoría + Subcategoría — selects del catalog */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Categoría *
              </label>
              <select
                required
                value={values.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {catalog?.categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label.es}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Subcategoría *
              </label>
              <select
                required
                value={values.subcategory}
                disabled={!values.category}
                onChange={(e) => setField('subcategory', e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>
                  {values.category
                    ? 'Selecciona una subcategoría'
                    : 'Primero elige categoría'}
                </option>
                {subcategories.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label.es}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ejemplos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                Ejemplos
              </label>
              <button
                type="button"
                onClick={addExample}
                className="text-xs text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] px-2 py-1 rounded transition"
              >
                + Agregar ejemplo
              </button>
            </div>
            <div className="space-y-2">
              {values.examples.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="flex gap-2 items-start p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)]"
                >
                  <span className="text-[var(--color-text-muted)] text-xs pt-2 w-4 shrink-0">
                    {ex.position}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Inglés"
                      value={ex.textEn}
                      onChange={(e) =>
                        updateExample(idx, 'textEn', e.target.value)
                      }
                      className="px-2 py-1.5 rounded bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-dim)]"
                    />
                    <input
                      type="text"
                      placeholder="Español"
                      value={ex.textEs}
                      onChange={(e) =>
                        updateExample(idx, 'textEs', e.target.value)
                      }
                      className="px-2 py-1.5 rounded bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-dim)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="text-red-400 hover:text-red-300 text-xs pt-2 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
