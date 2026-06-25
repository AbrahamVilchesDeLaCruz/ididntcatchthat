import { useState } from 'react';
import { useBulkCreateFlashcards, useGenerateFlashcards } from '../api';
import type { CreateFlashcardApiPayload } from '../api/flashcards.api-model';
import type { FlashcardDraftApiModel } from '../api/flashcards.api-model';

interface FlashcardAiGenerationState {
  drafts: FlashcardDraftApiModel[] | null;
  isGenerating: boolean;
  isConfirming: boolean;
}

interface FlashcardAiGenerationHandlers {
  generate: (params: {
    category: string;
    subcategory: string;
    count: number;
    prompt?: string;
  }) => void;
  confirm: (drafts: FlashcardDraftApiModel[]) => void;
  close: () => void;
}

export const useFlashcardAiGeneration = (): [
  FlashcardAiGenerationState,
  FlashcardAiGenerationHandlers,
] => {
  const [drafts, setDrafts] = useState<FlashcardDraftApiModel[] | null>(null);

  const { mutate: generateFlashcards, isPending: isGenerating } =
    useGenerateFlashcards();
  const { mutate: bulkCreateFlashcards, isPending: isConfirming } =
    useBulkCreateFlashcards();

  const generate: FlashcardAiGenerationHandlers['generate'] = (params) => {
    generateFlashcards(params, {
      onSuccess: (result) => {
        setDrafts(result);
      },
    });
  };

  const confirm: FlashcardAiGenerationHandlers['confirm'] = (draftItems) => {
    const flashcards: CreateFlashcardApiPayload[] = draftItems.map((draft) => ({
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
          setDrafts(null);
        },
      },
    );
  };

  return [
    { drafts, isGenerating, isConfirming },
    { generate, confirm, close: () => setDrafts(null) },
  ];
};
