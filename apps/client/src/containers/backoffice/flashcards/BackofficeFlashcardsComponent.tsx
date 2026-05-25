import { type ReactElement, useState } from 'react';
import type { FlashcardFormValues, FlashcardVM } from './flashcards.types';
import type {
  CreateFlashcardApiPayload,
  FlashcardDraftApiModel,
} from './api/flashcards.api-model';
import { FlashcardsTable } from './components/FlashcardsTable';
import { FlashcardFormModal } from './components/FlashcardFormModal';
import { FlashcardsToolbar } from './components/FlashcardsToolbar';
import { BulkCreateModal } from './components/BulkCreateModal';
import { ImportPdfModal } from './components/ImportPdfModal';

interface BackofficeFlashcardsComponentProps {
  flashcards: FlashcardVM[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  isImportingPdf: boolean;
  pdfDrafts: FlashcardDraftApiModel[] | null;
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
  onPdfUpload: (file: File) => void;
  onPdfConfirm: (drafts: FlashcardDraftApiModel[]) => void;
  onPdfDraftsClose: () => void;
}

export const BackofficeFlashcardsComponent = ({
  flashcards,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  isMutating,
  isImportingPdf,
  pdfDrafts,
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
  onPdfUpload,
  onPdfConfirm,
  onPdfDraftsClose,
}: BackofficeFlashcardsComponentProps): ReactElement => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isImportPdfModalOpen, setIsImportPdfModalOpen] = useState(false);
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
        Error al cargar los flashcards. Intentalo de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-gray-400 text-sm mt-1">
            {total} flashcards en total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsImportPdfModalOpen(true)}
            className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition text-sm border border-white/10"
          >
            📄 Importar PDF
          </button>
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition text-sm border border-white/10"
          >
            + Bloque
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition text-sm"
          >
            + Nueva flashcard
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <FlashcardsToolbar
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
        onEdit={setEditingFlashcard}
        onDelete={setDeletingId}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <FlashcardFormModal
          title="Nueva flashcard"
          isLoading={isMutating}
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {editingFlashcard && (
        <FlashcardFormModal
          title="Editar flashcard"
          initialValues={{
            expression: editingFlashcard.expression,
            meaning: editingFlashcard.meaning,
            category: editingFlashcard.category,
            subcategory: editingFlashcard.subcategory,
            ipaNotation: editingFlashcard.ipaNotation ?? '',
            nativeSpeech: editingFlashcard.nativeSpeech ?? '',
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
          <div className="bg-[var(--color-bg-surface,#1a1a2e)] rounded-xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-2">
              ¿Eliminar flashcard?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isMutating}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
              >
                Eliminar
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
      {isImportPdfModalOpen && (
        <ImportPdfModal
          isUploading={isImportingPdf}
          isImporting={isMutating}
          drafts={pdfDrafts}
          onUpload={onPdfUpload}
          onConfirm={(drafts) => {
            onPdfConfirm(drafts);
            setIsImportPdfModalOpen(false);
          }}
          onClose={() => {
            onPdfDraftsClose();
            setIsImportPdfModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
