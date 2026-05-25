import { type ReactElement, useState } from 'react';
import {
  useBulkCreateFlashcards,
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcardCatalog,
  useFlashcards,
  useImportPdfFlashcards,
  useUpdateFlashcard,
} from './api';
import type { FlashcardFormValues } from './flashcards.types';
import type {
  CreateFlashcardApiPayload,
  FlashcardDraftApiModel,
} from './api/flashcards.api-model';
import { BackofficeFlashcardsComponent } from './BackofficeFlashcardsComponent';

export const BackofficeFlashcardsContainer = (): ReactElement => {
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
  const [pdfDrafts, setPdfDrafts] = useState<FlashcardDraftApiModel[] | null>(
    null,
  );

  const { data, isLoading, isError } = useFlashcards({
    page,
    pageSize: 20,
    category: categoryFilter,
    subcategory: subcategoryFilter,
    audioStatus: audioStatusFilter,
  });

  const { data: catalog } = useFlashcardCatalog();

  const { mutate: createFlashcard, isPending: isCreating } =
    useCreateFlashcard();
  const { mutate: updateFlashcard, isPending: isUpdating } =
    useUpdateFlashcard();
  const { mutate: deleteFlashcard, isPending: isDeleting } =
    useDeleteFlashcard();
  const { mutate: bulkCreateFlashcards, isPending: isBulkCreating } =
    useBulkCreateFlashcards();
  const { mutate: importPdf, isPending: isImportingPdf } =
    useImportPdfFlashcards();

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

  const handleDelete = (id: string): void => {
    deleteFlashcard(id);
  };

  const handleBulkCreate = (flashcards: CreateFlashcardApiPayload[]): void => {
    bulkCreateFlashcards({ flashcards });
  };

  const handlePdfUpload = (file: File): void => {
    importPdf(file, {
      onSuccess: (drafts) => {
        setPdfDrafts(drafts);
      },
    });
  };

  const handlePdfConfirm = (drafts: FlashcardDraftApiModel[]): void => {
    const flashcards: CreateFlashcardApiPayload[] = drafts.map((draft) => ({
      id: globalThis.crypto.randomUUID(),
      expression: draft.expression,
      meaning: draft.meaning,
      category: draft.category,
      subcategory: draft.subcategory,
      ipaNotation: draft.ipaNotation,
      nativeSpeech: draft.nativeSpeech,
      examples: draft.examples.map((ex, i) => ({
        id: globalThis.crypto.randomUUID(),
        textEn: ex.textEn,
        textEs: ex.textEs,
        position: i + 1,
      })),
    }));
    bulkCreateFlashcards(
      { flashcards },
      {
        onSuccess: () => {
          setPdfDrafts(null);
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
      pageSize={data?.pageSize ?? 20}
      isLoading={isLoading}
      isError={isError}
      isMutating={isCreating || isUpdating || isDeleting || isBulkCreating}
      isImportingPdf={isImportingPdf}
      pdfDrafts={pdfDrafts}
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
      onBulkCreate={handleBulkCreate}
      onPdfUpload={handlePdfUpload}
      onPdfConfirm={handlePdfConfirm}
      onPdfDraftsClose={() => setPdfDrafts(null)}
    />
  );
};
