import { type ReactElement, useState } from 'react';
import type { FlashcardFormValues, FlashcardVM } from './flashcards.types';
import type {
  CreateFlashcardApiPayload,
  FlashcardCatalogApiModel,
  FlashcardDraftApiModel,
} from './api/flashcards.api-model';
import { FlashcardsTable } from './components/FlashcardsTable';
import { FlashcardFormModal } from './components/FlashcardFormModal';
import { FlashcardsToolbar } from './components/FlashcardsToolbar';
import { BulkCreateModal } from './components/BulkCreateModal';
import { AiGenerateModal } from './components/AiGenerateModal';
import { FlashcardDetailModal } from './components/FlashcardDetailModal';
import { useI18n } from '@/core/i18n';

interface BackofficeFlashcardsComponentProps {
  flashcards: FlashcardVM[];
  catalog: FlashcardCatalogApiModel | undefined;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  isGeneratingAi: boolean;
  aiDrafts: FlashcardDraftApiModel[] | null;
  categoryFilter: string | undefined;
  subcategoryFilter: string | undefined;
  audioStatusFilter: string | undefined;
  onPageChange: (page: number) => void;
  onCategoryFilter: (category: string | undefined) => void;
  onSubcategoryFilter: (subcategory: string | undefined) => void;
  onAudioStatusFilter: (audioStatus: string | undefined) => void;
  onCreate: (values: FlashcardFormValues) => void;
  onUpdate: (id: string, values: Partial<FlashcardFormValues>) => void;
  onDelete: (id: string) => void;
  onBulkCreate: (flashcards: CreateFlashcardApiPayload[]) => void;
  onAiGenerate: (params: {
    category: string;
    subcategory: string;
    count: number;
    prompt?: string;
  }) => void;
  onDraftConfirm: (drafts: FlashcardDraftApiModel[]) => void;
  onAiDraftsClose: () => void;
}

export const BackofficeFlashcardsComponent = ({
  flashcards,
  catalog,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  isMutating,
  isGeneratingAi,
  aiDrafts,
  categoryFilter,
  subcategoryFilter,
  audioStatusFilter,
  onPageChange,
  onCategoryFilter,
  onSubcategoryFilter,
  onAudioStatusFilter,
  onCreate,
  onUpdate,
  onDelete,
  onBulkCreate,
  onAiGenerate,
  onDraftConfirm,
  onAiDraftsClose,
}: BackofficeFlashcardsComponentProps): ReactElement => {
  const { t } = useI18n();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [viewingFlashcard, setViewingFlashcard] = useState<FlashcardVM | null>(
    null,
  );
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardVM | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const handleCreateSubmit = (values: FlashcardFormValues): void => {
    onCreate(values);
    setIsCreateModalOpen(false);
  };

  const handleUpdateSubmit = (values: FlashcardFormValues): void => {
    if (!editingFlashcard) return;
    onUpdate(editingFlashcard.id, values);
    setEditingFlashcard(null);
  };

  const handleDeleteConfirm = (): void => {
    if (!deletingId) return;
    onDelete(deletingId);
    setDeletingId(null);
  };

  const handleBulkSubmit = (flashcards: CreateFlashcardApiPayload[]): void => {
    onBulkCreate(flashcards);
    setIsBulkModalOpen(false);
  };

  if (isError) {
    return (
      <div className="text-red-400 text-center py-16">
        {t.backoffice.flashcards.loadError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t.backoffice.flashcards.title}
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            {t.backoffice.flashcards.subtitle.replace('{count}', String(total))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-4 py-2 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-[var(--color-bg-card)] transition text-sm border border-[var(--color-border)]"
          >
            {t.backoffice.flashcards.aiGenerate}
          </button>
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-medium rounded-lg hover:bg-[var(--color-bg-card)] transition text-sm border border-[var(--color-border)]"
          >
            {t.backoffice.flashcards.bulkCreate}
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[var(--color-brand)] text-white font-semibold rounded-lg hover:opacity-90 transition text-sm"
          >
            {t.backoffice.flashcards.newFlashcard}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <FlashcardsToolbar
        catalog={catalog}
        categoryFilter={categoryFilter}
        subcategoryFilter={subcategoryFilter}
        audioStatusFilter={audioStatusFilter}
        onCategoryFilter={onCategoryFilter}
        onSubcategoryFilter={onSubcategoryFilter}
        onAudioStatusFilter={onAudioStatusFilter}
      />

      {/* Table */}
      <FlashcardsTable
        flashcards={flashcards}
        isLoading={isLoading}
        onView={setViewingFlashcard}
        onEdit={setEditingFlashcard}
        onDelete={setDeletingId}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <span>
            {t.backoffice.flashcards.pageOf
              .replace('{page}', String(page))
              .replace('{total}', String(totalPages))}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {t.backoffice.flashcards.previous}
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] border border-[var(--color-border)] disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              {t.backoffice.flashcards.next}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingFlashcard && (
        <FlashcardDetailModal
          flashcard={viewingFlashcard}
          onClose={() => setViewingFlashcard(null)}
        />
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <FlashcardFormModal
          title={t.backoffice.flashcards.createTitle}
          catalog={catalog}
          isLoading={isMutating}
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editingFlashcard && (
        <FlashcardFormModal
          title={t.backoffice.flashcards.editTitle}
          catalog={catalog}
          initialValues={{
            expression: editingFlashcard.expression,
            meaning: editingFlashcard.meaning,
            category: editingFlashcard.category,
            subcategory: editingFlashcard.subcategory,
            examples: editingFlashcard.examples,
          }}
          isLoading={isMutating}
          onSubmit={handleUpdateSubmit}
          onClose={() => setEditingFlashcard(null)}
        />
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-surface)] rounded-xl p-6 w-full max-w-sm border border-[var(--color-border)]">
            <h3 className="text-[var(--color-text-primary)] font-semibold text-lg mb-2">
              {t.backoffice.flashcards.deleteConfirmTitle}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-6">
              {t.backoffice.flashcards.deleteConfirmBody}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
              >
                {t.backoffice.flashcards.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isMutating}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
              >
                {t.backoffice.flashcards.delete}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Create Modal */}
      {isBulkModalOpen && (
        <BulkCreateModal
          isLoading={isMutating}
          onSubmit={handleBulkSubmit}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}

      {/* Import PDF Modal */}
      {isAiModalOpen && (
        <AiGenerateModal
          catalog={catalog}
          isGenerating={isGeneratingAi}
          isImporting={isMutating}
          drafts={aiDrafts}
          onGenerate={onAiGenerate}
          onConfirm={(drafts) => {
            onDraftConfirm(drafts);
            setIsAiModalOpen(false);
          }}
          onClose={() => {
            onAiDraftsClose();
            setIsAiModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
