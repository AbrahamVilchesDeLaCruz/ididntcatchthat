import { type ReactElement, useState } from 'react';
import {
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
  useUpdateFlashcard,
} from './api';
import type { FlashcardFormValues } from './flashcards.types';
import { BackofficeFlashcardsComponent } from './BackofficeFlashcardsComponent';

export const BackofficeFlashcardsContainer = (): ReactElement => {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined,
  );

  const { data, isLoading, isError } = useFlashcards({
    page,
    pageSize: 20,
    category: categoryFilter,
  });

  const { mutate: createFlashcard, isPending: isCreating } =
    useCreateFlashcard();
  const { mutate: updateFlashcard, isPending: isUpdating } =
    useUpdateFlashcard();
  const { mutate: deleteFlashcard, isPending: isDeleting } =
    useDeleteFlashcard();

  const handleCreate = (values: FlashcardFormValues): void => {
    createFlashcard({
      id: globalThis.crypto.randomUUID(),
      expression: values.expression,
      meaning: values.meaning,
      category: values.category,
      subcategory: values.subcategory,
      ipaNotation: values.ipaNotation || null,
      nativeSpeech: values.nativeSpeech || null,
      examples: values.examples,
    });
  };

  const handleUpdate = (
    id: string,
    values: Partial<FlashcardFormValues>,
  ): void => {
    updateFlashcard({ id, data: values });
  };

  const handleDelete = (id: string): void => {
    deleteFlashcard(id);
  };

  return (
    <BackofficeFlashcardsComponent
      flashcards={data?.items ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={data?.pageSize ?? 20}
      isLoading={isLoading}
      isError={isError}
      isMutating={isCreating || isUpdating || isDeleting}
      categoryFilter={categoryFilter}
      onPageChange={setPage}
      onCategoryFilter={setCategoryFilter}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
};
