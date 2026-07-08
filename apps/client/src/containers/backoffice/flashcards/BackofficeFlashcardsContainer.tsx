import { type ReactElement, useState } from 'react';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import {
  useBulkCreateFlashcards,
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcardCatalog,
  useFlashcards,
  useUpdateFlashcard,
  useRegenerateFlashcardAudio,
} from './api';
import type { FlashcardFormValues } from './flashcards.types';
import type { CreateFlashcardApiPayload } from './api/flashcards.api-model';
import { useFlashcardAiGeneration } from './hooks';
import { BackofficeFlashcardsComponent } from './BackofficeFlashcardsComponent';
import { useI18n } from '@/core/i18n';
import { useToastStore } from '@/core/notifications/toast.store';

export const BackofficeFlashcardsContainer = (): ReactElement => {
  const { canManageFlashcards } = useCurrentUser();
  const { t } = useI18n();
  const pushToast = useToastStore((s) => s.push);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined,
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState<
    string | undefined
  >(undefined);
  const [audioStatusFilter, setAudioStatusFilter] = useState<
    string | undefined
  >(undefined);

  const { data, isLoading, isError } = useFlashcards(
    {
      page,
      pageSize: 10,
      category: categoryFilter,
      subcategory: subcategoryFilter,
      audioStatus: audioStatusFilter,
    },
    { enabled: canManageFlashcards },
  );

  const { data: catalog } = useFlashcardCatalog();

  const { mutate: createFlashcard, isPending: isCreating } =
    useCreateFlashcard();
  const { mutate: updateFlashcard, isPending: isUpdating } =
    useUpdateFlashcard();
  const { mutate: deleteFlashcard, isPending: isDeleting } =
    useDeleteFlashcard();
  const { mutate: regenerateFlashcardAudio, isPending: isRegeneratingAudio } =
    useRegenerateFlashcardAudio();
  const { mutate: bulkCreateFlashcards, isPending: isBulkCreating } =
    useBulkCreateFlashcards();

  const [aiState, aiHandlers] = useFlashcardAiGeneration();

  const handleCreate = (values: FlashcardFormValues): void => {
    createFlashcard({
      id: globalThis.crypto.randomUUID(),
      expression: values.expression,
      meaning: values.meaning,
      category: values.category,
      subcategory: values.subcategory,
      ipaNotation: null,
      nativeSpeech: null,
      examples: values.examples,
    });
  };

  const handleUpdate = (
    id: string,
    values: Partial<FlashcardFormValues>,
  ): void => {
    updateFlashcard({ id, data: values });
  };

  const handleDelete = (
    id: string,
    callbacks?: { onSuccess?: () => void; onError?: () => void },
  ): void => {
    deleteFlashcard(id, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: () => {
        pushToast({ message: t.backoffice.flashcards.deleteError });
        callbacks?.onError?.();
      },
    });
  };

  const handleBulkCreate = (flashcards: CreateFlashcardApiPayload[]): void => {
    bulkCreateFlashcards({ flashcards });
  };

  const handleRegenerateAudio = (
    id: string,
    callbacks?: { onSuccess?: () => void },
  ): void => {
    regenerateFlashcardAudio(id, {
      onSuccess: () => {
        callbacks?.onSuccess?.();
      },
      onError: () => {
        pushToast({ message: t.backoffice.flashcards.detail.failedAudio });
      },
    });
  };

  return (
    <BackofficeFlashcardsComponent
      flashcards={data?.items ?? []}
      catalog={catalog}
      total={data?.total ?? 0}
      page={page}
      pageSize={data?.pageSize ?? 20}
      isLoading={isLoading}
      isError={isError}
      isMutating={isCreating || isUpdating || isDeleting || isBulkCreating}
      isRegeneratingAudio={isRegeneratingAudio}
      isGeneratingAi={aiState.isGenerating}
      aiDrafts={aiState.drafts}
      categoryFilter={categoryFilter}
      subcategoryFilter={subcategoryFilter}
      audioStatusFilter={audioStatusFilter}
      onPageChange={setPage}
      onCategoryFilter={setCategoryFilter}
      onSubcategoryFilter={setSubcategoryFilter}
      onAudioStatusFilter={setAudioStatusFilter}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRegenerateAudio={handleRegenerateAudio}
      onBulkCreate={handleBulkCreate}
      onAiGenerate={aiHandlers.generate}
      onDraftConfirm={aiHandlers.confirm}
      onAiDraftsClose={aiHandlers.close}
    />
  );
};
