import { type ReactElement, useState } from 'react';
import type {
  FlashcardExampleVM,
  FlashcardFormValues,
} from '../flashcards.types';

interface FlashcardFormModalProps {
  title: string;
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
  ipaNotation: '',
  nativeSpeech: '',
  examples: [],
};

export const FlashcardFormModal = ({
  title,
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
      <div className="w-full max-w-2xl bg-[var(--color-bg-surface,#1a1a2e)] rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Expresión *
              </label>
              <input
                type="text"
                required
                value={values.expression}
                onChange={(e) => setField('expression', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Significado *
              </label>
              <input
                type="text"
                required
                value={values.meaning}
                onChange={(e) => setField('meaning', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Categoría *
              </label>
              <input
                type="text"
                required
                value={values.category}
                onChange={(e) => setField('category', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Subcategoría *
              </label>
              <input
                type="text"
                required
                value={values.subcategory}
                onChange={(e) => setField('subcategory', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                IPA Notation
              </label>
              <input
                type="text"
                value={values.ipaNotation}
                onChange={(e) => setField('ipaNotation', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="/ˈɛk.spre.ʃən/"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Native Speech
              </label>
              <input
                type="text"
                value={values.nativeSpeech}
                onChange={(e) => setField('nativeSpeech', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Transcripción fonética"
              />
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                Ejemplos
              </label>
              <button
                type="button"
                onClick={addExample}
                className="text-xs text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
              >
                + Agregar ejemplo
              </button>
            </div>
            <div className="space-y-2">
              {values.examples.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="flex gap-2 items-start p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className="text-gray-500 text-xs pt-2 w-4 shrink-0">
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
                      className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                    <input
                      type="text"
                      placeholder="Español"
                      value={ex.textEs}
                      onChange={(e) =>
                        updateExample(idx, 'textEs', e.target.value)
                      }
                      className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white/20"
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
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
