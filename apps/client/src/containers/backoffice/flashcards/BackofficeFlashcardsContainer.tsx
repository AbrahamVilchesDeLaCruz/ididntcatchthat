import { type ReactElement, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/core/auth/useCurrentUser';
import {
  useBulkCreateFlashcards,
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcardCatalog,
  useFlashcards,
  useUpdateFlashcard,
  useRegenerateFlashcardAudio,
  useRegenerateFlashcardAudioBulk,
  flashcardKeys,
} from './api';
import type { FlashcardFormValues } from './flashcards.types';
import type { CreateFlashcardApiPayload } from './api/flashcards.api-model';
import { useFlashcardAiGeneration } from './hooks';
import { BackofficeFlashcardsComponent } from './BackofficeFlashcardsComponent';
import { useI18n } from '@/core/i18n';
import { isApiRequestError } from '@/core/api/apiError';
import { useToastStore } from '@/core/notifications/toast.store';

const FLASHCARDS_PAGE_SIZE = 10;

export const BackofficeFlashcardsContainer = (): ReactElement => {
  const { canManageFlashcards } = useCurrentUser();
  const { t } = useI18n();
  const pushToast = useToastStore((s) => s.push);
  const queryClient = useQueryClient();
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

  const handleCategoryFilter = (category: string | undefined): void => {
    setCategoryFilter(category);
    setPage(1);
  };

  const handleSubcategoryFilter = (subcategory: string | undefined): void => {
    setSubcategoryFilter(subcategory);
    setPage(1);
  };

  const handleAudioStatusFilter = (audioStatus: string | undefined): void => {
    setAudioStatusFilter(audioStatus);
    setPage(1);
  };

  const { data, isLoading, isLoadingError } = useFlashcards(
    {
      page,
      pageSize: FLASHCARDS_PAGE_SIZE,
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
  const {
    mutate: regenerateFlashcardAudioBulk,
    isPending: isBulkRegeneratingAudio,
  } = useRegenerateFlashcardAudioBulk();
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
      onError: (error) => {
        if (isApiRequestError(error) && error.status === 429) {
          pushToast({ message: t.backoffice.flashcards.rateLimitError });
          return;
        }
        if (
          isApiRequestError(error) &&
          error.status === 422 &&
          error.errorType === 'AudioStatusInvalid'
        ) {
          void queryClient.invalidateQueries({
            queryKey: flashcardKeys.lists(),
          });
          pushToast({
            message: t.backoffice.flashcards.audioAlreadyReadyError,
          });
          return;
        }
        pushToast({ message: t.backoffice.flashcards.detail.failedAudio });
      },
    });
  };

  const handleBulkRegenerateAudio = (): void => {
    if (audioStatusFilter !== 'pending' && audioStatusFilter !== 'failed') {
      return;
    }

    regenerateFlashcardAudioBulk(
      {
        audioStatus: audioStatusFilter,
        category: categoryFilter,
        subcategory: subcategoryFilter,
        page,
        pageSize: FLASHCARDS_PAGE_SIZE,
      },
      {
        onSuccess: (result) => {
          if (result.triggered === 0) {
            pushToast({ message: t.backoffice.flashcards.bulkRegenerateEmpty });
            return;
          }
          pushToast({
            message: t.backoffice.flashcards.bulkRegenerateSuccess.replace(
              '{count}',
              String(result.triggered),
            ),
          });
        },
        onError: (error) => {
          if (isApiRequestError(error) && error.status === 429) {
            pushToast({ message: t.backoffice.flashcards.rateLimitError });
            return;
          }
          pushToast({ message: t.backoffice.flashcards.detail.failedAudio });
        },
      },
    );
  };

  return (
    <BackofficeFlashcardsComponent
      flashcards={data?.items ?? []}
      catalog={catalog}
      total={data?.total ?? 0}
      page={page}
      pageSize={data?.pageSize ?? FLASHCARDS_PAGE_SIZE}
      isLoading={isLoading}
      isError={isLoadingError}
      isMutating={isCreating || isUpdating || isDeleting || isBulkCreating}
      isRegeneratingAudio={isRegeneratingAudio}
      isBulkRegeneratingAudio={isBulkRegeneratingAudio}
      isGeneratingAi={aiState.isGenerating}
      aiDrafts={aiState.drafts}
      categoryFilter={categoryFilter}
      subcategoryFilter={subcategoryFilter}
      audioStatusFilter={audioStatusFilter}
      onPageChange={setPage}
      onCategoryFilter={handleCategoryFilter}
      onSubcategoryFilter={handleSubcategoryFilter}
      onAudioStatusFilter={handleAudioStatusFilter}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRegenerateAudio={handleRegenerateAudio}
      onBulkRegenerateAudio={handleBulkRegenerateAudio}
      onBulkCreate={handleBulkCreate}
      onAiGenerate={aiHandlers.generate}
      onDraftConfirm={aiHandlers.confirm}
      onAiDraftsClose={aiHandlers.close}
    />
  );
};
