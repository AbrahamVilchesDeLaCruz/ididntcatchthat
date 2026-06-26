import { useMemo, useState, type ReactElement } from 'react';
import type {
  FlashcardCatalogApiModel,
  FlashcardDraftApiModel,
} from '../api/flashcards.api-model';
import { DraftPreviewPanel } from './DraftPreviewPanel';

type Step = 'configure' | 'preview';

const COUNT_OPTIONS = [5, 10, 15, 20] as const;

interface AiGenerateModalProps {
  catalog: FlashcardCatalogApiModel | undefined;
  isGenerating: boolean;
  isImporting: boolean;
  drafts: FlashcardDraftApiModel[] | null;
  onGenerate: (params: {
    category: string;
    subcategory: string;
    count: number;
    prompt?: string;
  }) => void;
  onConfirm: (drafts: FlashcardDraftApiModel[]) => void;
  onClose: () => void;
}

export const AiGenerateModal = ({
  catalog,
  isGenerating,
  isImporting,
  drafts,
  onGenerate,
  onConfirm,
  onClose,
}: AiGenerateModalProps): ReactElement => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [count, setCount] = useState<number>(10);
  const [prompt, setPrompt] = useState('');

  const step: Step = drafts !== null ? 'preview' : 'configure';

  const selectedCategory = useMemo(
    () => catalog?.categories.find((c) => c.value === category),
    [catalog, category],
  );

  const selectedSubcategoryMeta = useMemo(
    () => selectedCategory?.subcategories.find((s) => s.value === subcategory),
    [selectedCategory, subcategory],
  );

  const handleGenerate = (): void => {
    if (!category || !subcategory) return;
    onGenerate({
      category,
      subcategory,
      count,
      prompt: prompt.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-bg-surface,#1a1a2e)] rounded-xl w-full max-w-2xl border border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">Generar con IA</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {step === 'configure'
                ? 'Elegí categoría, subcategoría y cantidad'
                : `${String(drafts?.length ?? 0)} borradores — revisá y confirmá`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating || isImporting}
            className="text-gray-400 hover:text-white transition text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {step === 'configure' ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  <option value="">Seleccioná categoría</option>
                  {catalog?.categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label.es}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Subcategoría
                </label>
                <select
                  value={subcategory}
                  disabled={!category}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-40"
                >
                  <option value="">
                    {category
                      ? 'Seleccioná subcategoría'
                      : 'Elegí categoría primero'}
                  </option>
                  {selectedCategory?.subcategories.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label.es}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubcategoryMeta && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs text-gray-400 space-y-1">
                  <p>{selectedSubcategoryMeta.description.es}</p>
                  {selectedSubcategoryMeta.anchorExamples.length > 0 && (
                    <p>
                      Ejemplos tipo:{' '}
                      {selectedSubcategoryMeta.anchorExamples.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Cantidad
                </label>
                <div className="flex gap-2">
                  {COUNT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={[
                        'flex-1 py-2 rounded-lg text-sm font-medium border transition',
                        count === n
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white border-white/10 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Instrucciones extra (opcional)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="Ej: expresiones cortas, nivel intermedio…"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
                />
              </div>
            </>
          ) : (
            drafts && <DraftPreviewPanel drafts={drafts} />
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          {step === 'configure' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !category || !subcategory}
                className="px-5 py-2 text-sm bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGenerating ? 'Generando…' : 'Generar borradores'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => drafts && onConfirm(drafts)}
                disabled={isImporting || !drafts?.length}
                className="px-5 py-2 text-sm bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isImporting
                  ? 'Guardando…'
                  : `Confirmar ${String(drafts?.length ?? 0)} flashcards`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
