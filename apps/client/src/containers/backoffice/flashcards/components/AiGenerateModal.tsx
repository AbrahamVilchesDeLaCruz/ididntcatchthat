import { useMemo, useState, type ReactElement } from 'react';
import type {
  FlashcardCatalogApiModel,
  FlashcardDraftApiModel,
} from '../api/flashcards.api-model';
import { DraftPreviewPanel } from './DraftPreviewPanel';
import { AppSelect } from '@/common/components/ui/select';
import { useI18n } from '@/core/i18n';

type Step = 'configure' | 'preview';

const COUNT_OPTIONS = [5, 10, 15, 20] as const;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-dim)]';

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
  const { locale, t } = useI18n();
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
      <div className="bg-[var(--color-bg-surface)] rounded-xl w-full max-w-2xl border border-[var(--color-border)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-[var(--color-text-primary)] font-semibold text-lg">
              {t.backoffice.flashcards.ai.title}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
              {step === 'configure'
                ? t.backoffice.flashcards.ai.configureSubtitle
                : t.backoffice.flashcards.ai.previewSubtitle.replace(
                    '{count}',
                    String(drafts?.length ?? 0),
                  )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating || isImporting}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {step === 'configure' ? (
            <>
              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  {t.backoffice.flashcards.ai.category}
                </label>
                <AppSelect.Root
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value ?? '');
                    setSubcategory('');
                  }}
                >
                  <AppSelect.Trigger>
                    <AppSelect.Value
                      placeholder={t.backoffice.flashcards.ai.selectCategory}
                    />
                    <AppSelect.Icon />
                  </AppSelect.Trigger>
                  <AppSelect.Portal>
                    <AppSelect.Positioner>
                      <AppSelect.Popup>
                        <AppSelect.List>
                          {catalog?.categories.map((c) => (
                            <AppSelect.Item key={c.value} value={c.value}>
                              {c.label[locale]}
                            </AppSelect.Item>
                          ))}
                        </AppSelect.List>
                      </AppSelect.Popup>
                    </AppSelect.Positioner>
                  </AppSelect.Portal>
                </AppSelect.Root>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  {t.backoffice.flashcards.ai.subcategory}
                </label>
                <AppSelect.Root
                  value={subcategory}
                  disabled={!category}
                  onValueChange={(value) => {
                    setSubcategory(value ?? '');
                  }}
                >
                  <AppSelect.Trigger>
                    <AppSelect.Value
                      placeholder={
                        category
                          ? t.backoffice.flashcards.ai.selectSubcategory
                          : t.backoffice.flashcards.ai.chooseCategoryFirst
                      }
                    />
                    <AppSelect.Icon />
                  </AppSelect.Trigger>
                  <AppSelect.Portal>
                    <AppSelect.Positioner>
                      <AppSelect.Popup>
                        <AppSelect.List>
                          {selectedCategory?.subcategories.map((s) => (
                            <AppSelect.Item key={s.value} value={s.value}>
                              {s.label[locale]}
                            </AppSelect.Item>
                          ))}
                        </AppSelect.List>
                      </AppSelect.Popup>
                    </AppSelect.Positioner>
                  </AppSelect.Portal>
                </AppSelect.Root>
              </div>

              {selectedSubcategoryMeta && (
                <div className="rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-3 text-xs text-[var(--color-text-secondary)] space-y-1">
                  <p>{selectedSubcategoryMeta.description[locale]}</p>
                  {selectedSubcategoryMeta.anchorExamples.length > 0 && (
                    <p>
                      {t.backoffice.flashcards.ai.anchorExamples}{' '}
                      {selectedSubcategoryMeta.anchorExamples.join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  {t.backoffice.flashcards.ai.count}
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
                          ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]'
                          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-bg-card)]',
                      ].join(' ')}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-1">
                  {t.backoffice.flashcards.ai.extraInstructions}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder={
                    t.backoffice.flashcards.ai.extraInstructionsPlaceholder
                  }
                  className={`${inputClass} resize-none placeholder-[var(--color-text-muted)]`}
                />
              </div>
            </>
          ) : (
            drafts && <DraftPreviewPanel drafts={drafts} />
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
          {step === 'configure' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition disabled:opacity-50"
              >
                {t.backoffice.flashcards.cancel}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !category || !subcategory}
                className="px-5 py-2 text-sm bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isGenerating
                  ? t.backoffice.flashcards.ai.generating
                  : t.backoffice.flashcards.ai.generateDrafts}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isImporting}
                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition disabled:opacity-50"
              >
                {t.backoffice.flashcards.cancel}
              </button>
              <button
                type="button"
                onClick={() => drafts && onConfirm(drafts)}
                disabled={isImporting || !drafts?.length}
                className="px-5 py-2 text-sm bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isImporting
                  ? t.backoffice.flashcards.ai.importing
                  : t.backoffice.flashcards.ai.confirmDrafts.replace(
                      '{count}',
                      String(drafts?.length ?? 0),
                    )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
